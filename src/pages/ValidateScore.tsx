/* eslint-disable react-hooks/exhaustive-deps */
import React, { Fragment, useEffect, useState, useRef } from "react";
import Navigation from "../components/shared/Navigation";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import Loader from "../components/shared/Loader";
import { useTranslation } from "react-i18next";
import api from "../lib/axios";
import { getHmacKeyFromToken } from "./AddScore";
import Cookies from "js-cookie";
import { useLocation, useNavigate } from "react-router-dom";
import { IoMdArrowRoundBack } from "react-icons/io";

const ValidateScore = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const session = Cookies.get("session_key");
  const [loading, setLoading] = useState(false);
  const [scanError, setScanError] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const hmacKey = getHmacKeyFromToken(session);
  const location = useLocation();
  const qrRegionId = "qr-reader";

  const onScanComplete = async (decodedText: string) => {
    await stopScanner();

    try {
      const data = JSON.parse(decodedText);
      if (data.error) {
        window.alert("Invalid Score, please review.");
        setScanError(true);
        return;
      }
      data.playerTwo_hmacKey = hmacKey;
      const updatedScores = {
        ...data.scores,
        [hmacKey]: data.scores.opponentScore,
      };
      delete updatedScores.opponentScore;
      data.scores = updatedScores;

      setLoading(true);
      const response = await api.post("/api/v1/user/validate-score", {
        ...data,
        qrcode: decodedText,
      });

      if (response.status === 200) {
        window.alert(response.data.messages?.[0]);
        window.location.href = "/";
      } else {
        throw new Error(response.data.messages?.[0] || "Validation failed.");
      }
    } catch (error: any) {
      window.alert(
        error?.response?.data?.messages[0] ||
          "An error occurred. Please try again."
      );
      setScanError(true);
    } finally {
      setLoading(false);
    }
  };

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      setPermissionDenied(false);
      startScanner();
    } catch (error) {
      setPermissionDenied(true);
      alert("Camera access denied. Please allow it in your browser settings.");
    }
  };

  const startScanner = async () => {
    setScanError(false);

    if (scannerRef.current) {
      await stopScanner();
    }

    const config = {
      fps: 10,
      qrbox: { width: 300, height: 300 },
    };

    const html5QrCode = new Html5Qrcode(qrRegionId);
    scannerRef.current = html5QrCode;

    try {
      await html5QrCode.start(
        { facingMode: "environment" }, // Use back camera
        config,
        (decodedText) => {
          onScanComplete(decodedText);
        },
        (error) => {
          console.warn("QR Scan Error:", error);
        }
      );
    } catch (err) {
      console.error("Failed to start QR scanner", err);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (
          state === Html5QrcodeScannerState.SCANNING ||
          state === Html5QrcodeScannerState.PAUSED
        ) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (error) {
        console.warn("Error stopping scanner", error);
      } finally {
        scannerRef.current = null;
      }
    }
  };

  useEffect(() => {
    requestCameraPermission();
    return () => {
      stopScanner();
    };
  }, []);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [location.pathname]);

  return (
    <Fragment>
      <Navigation />
      <section className="container md:py-8 py-6 max-w-[800px]">
        <button
          onClick={() => navigate(-1)}
          className="border border-tableBorder shadow-table rounded-lg px-4 py-1.5 flex justify-center items-center gap-2 text-sm"
        >
          <IoMdArrowRoundBack />
          {t("back")}
        </button>

        <div className="rounded-lg overflow-hidden shadow-table border border-tableBorder mt-4">
          {/* Header */}
          <div className="p-4 border-b border-tableBorder">
            <h1 className="text-xl font-primary font-medium text-brand-black">
              {t("qr code scanner")}
            </h1>
          </div>

          <div className="p-4">
            {loading ? (
              <Loader />
            ) : (
              <Fragment>
                {permissionDenied ? (
                  <div className="text-center">
                    <p className="text-red-500">
                      {t("Camera access is required to scan QR codes.")}
                    </p>
                    <button
                      onClick={() => requestCameraPermission()}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg"
                    >
                      {t("Grant Camera Permission")}
                    </button>
                  </div>
                ) : (
                  <div
                    id={qrRegionId}
                    className="rounded-lg !overflow-hidden"
                  />
                )}
                {scanError && (
                  <div className="w-full flex justify-center items-center">
                    <button
                      onClick={startScanner}
                      className="px-4 py-2 bg-brand-primary text-white rounded-lg mx-auto"
                    >
                      {t("Rescan QR Code")}
                    </button>
                  </div>
                )}
              </Fragment>
            )}
          </div>
        </div>
      </section>
    </Fragment>
  );
};

export default ValidateScore;
