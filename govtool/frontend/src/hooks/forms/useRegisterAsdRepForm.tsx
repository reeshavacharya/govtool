import { Dispatch, SetStateAction, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useFormContext } from "react-hook-form";
import { blake2bHex } from "blakejs";
import * as Sentry from "@sentry/react";
import { NodeObject } from "jsonld";

import {
  CIP_119,
  DREP_CONTEXT,
  PATHS,
  storageInformationErrorModals,
} from "@consts";
import { useCardano, useModal, useAppContext } from "@context";
import { MetadataStandard, MetadataValidationStatus } from "@models";
import {
  downloadJson,
  ellipsizeText,
  generateJsonld,
  generateMetadataBody,
} from "@utils";

import { useGetVoterInfo, useWalletErrorModal } from "@hooks";
import { useValidateMutation } from "../mutations";

export type RegisterAsDRepValues = {
  givenName: string;
  objectives: string;
  motivations: string;
  qualifications: string;
  paymentAddress: string;
  references?: Array<{ uri: string }>;
  storeData?: boolean;
  storingURL: string;
};

export const defaultRegisterAsDRepValues: RegisterAsDRepValues = {
  givenName: "",
  objectives: "",
  motivations: "",
  qualifications: "",
  paymentAddress: "",
  references: [{ uri: "" }],
  storeData: false,
  storingURL: "",
};

export const useRegisterAsdRepForm = (
  setStep?: Dispatch<SetStateAction<number>>,
) => {
  // Local state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hash, setHash] = useState<string | null>(null);
  const [json, setJson] = useState<NodeObject | null>(null);

  // DApp Connector
  const {
    buildDRepRegCert,
    buildDRepUpdateCert,
    buildSignSubmitConwayCertTx,
    buildVoteDelegationCert,
    dRepID,
  } = useCardano();

  // App Management
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { closeModal, openModal } = useModal();
  const openWalletErrorModal = useWalletErrorModal();
  const { cExplorerBaseUrl } = useAppContext();

  // Queries
  const { validateMetadata } = useValidateMutation();
  const { voter } = useGetVoterInfo();

  // Form
  const {
    control,
    getValues,
    handleSubmit,
    formState: { errors, isValid },
    register,
    watch,
  } = useFormContext<RegisterAsDRepValues>();

  const givenName = watch("givenName");
  const isError = Object.keys(errors).length > 0;

  // Navigation
  const backToForm = useCallback(() => {
    window.scrollTo(0, 0);
    setStep?.(2);
    closeModal();
  }, [setStep]);

  const backToDashboard = useCallback(() => {
    navigate(PATHS.dashboard);
    closeModal();
  }, []);

  // Business Logic
  const generateMetadata = useCallback(async () => {
    const body = generateMetadataBody({
      data: getValues(),
      acceptedKeys: [
        "givenName",
        "objectives",
        "motivations",
        "qualifications",
        "paymentAddress",
        "references",
      ],
      standardReference: CIP_119,
    });

    const jsonld = await generateJsonld(body, DREP_CONTEXT, CIP_119);

    const jsonHash = blake2bHex(JSON.stringify(jsonld), undefined, 32);

    setHash(jsonHash);
    setJson(jsonld);

    return jsonld;
  }, []);

  const onClickDownloadJson = async () => {
    if (!json) return;

    downloadJson(json, ellipsizeText(givenName, 16, ""));
  };

  const createRegistrationCert = useCallback(
    async (data: RegisterAsDRepValues) => {
      if (!hash) return;
      const url = data.storingURL;
      try {
        const certBuilder = await buildVoteDelegationCert(dRepID);

        const registerCert = voter?.isRegisteredAsSoleVoter
          ? await buildDRepUpdateCert(url, hash)
          : await buildDRepRegCert(url, hash);

        certBuilder.add(registerCert);

        return certBuilder;
      } catch (error) {
        Sentry.setTag("hook", "useRegisterAsdRepForm");
        Sentry.captureException(error);
        throw error;
      }
    },
    [
      buildDRepRegCert,
      buildDRepUpdateCert,
      hash,
      voter?.isRegisteredAsSoleVoter,
    ],
  );

  const showLoadingModal = useCallback(() => {
    openModal({
      type: "loadingModal",
      state: {
        title: t("modals.pendingValidation.title"),
        message: t("modals.pendingValidation.message"),
        dataTestId: "storing-information-loading",
      },
    });
  }, []);

  const showSuccessModal = useCallback((link: string) => {
    openModal({
      type: "statusModal",
      state: {
        link: `${cExplorerBaseUrl}/tx/${link}`,
        status: "success",
        title: t("modals.registration.title"),
        message: t("modals.registration.message"),
        buttonText: t("modals.common.goToDashboard"),
        dataTestId: "governance-action-submitted-modal",
        onSubmit: backToDashboard,
      },
    });
  }, []);

  const onSubmit = useCallback(
    async (data: RegisterAsDRepValues) => {
      try {
        if (!hash) throw MetadataValidationStatus.INVALID_HASH;

        setIsLoading(true);
        showLoadingModal();

        const { status } = await validateMetadata({
          url: data.storingURL,
          hash,
          standard: MetadataStandard.CIP119,
        });

        if (status) {
          throw status;
        }
        const registerAsDRepCert = await createRegistrationCert(data);
        const result = await buildSignSubmitConwayCertTx({
          certBuilder: registerAsDRepCert,
          type: "registerAsDrep",
        });

        if (result) showSuccessModal(result);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        if (Object.values(MetadataValidationStatus).includes(error)) {
          openModal({
            type: "statusModal",
            state: {
              ...storageInformationErrorModals[
                error as MetadataValidationStatus
              ],
              onSubmit: backToForm,
              onCancel: backToDashboard,
            },
          });
        } else {
          Sentry.setTag("hook", "useRegisterAsdRepForm");
          Sentry.captureException(error);

          openWalletErrorModal({
            error,
            onSumbit: () => backToDashboard(),
            dataTestId: "registration-transaction-error-modal",
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [buildSignSubmitConwayCertTx, createRegistrationCert, hash],
  );

  return {
    control,
    errors,
    generateMetadata,
    getValues,
    isError,
    isRegistrationAsDRepLoading: isLoading,
    isValid,
    onClickDownloadJson,
    register,
    registerAsDrep: handleSubmit(onSubmit),
    watch,
  };
};
