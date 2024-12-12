import Button from "@/components/buttons/Button";
import Input from "@/components/form/Input";
import UploadImage from "@/components/form/UploadImage";
import Typography from "@/components/Typography";
import { Box } from "@mui/material";
import Modal from "@mui/material/Modal";
import * as tf from "@tensorflow/tfjs";
import * as tfNode from "@tensorflow/tfjs-node";

import { serialize } from "object-to-formdata";

import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { classNames } from "@/app/const/TumbuhanClassnames";

interface SensorFormData {
  moisture: string;
  nama: string;
  gambar: File[];
}

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 800,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export default function PlantAdd() {
  const [model, setModel] = useState<tf.LayersModel>();
  const [recommendation, setRecommendation] = useState("");

  useEffect(() => {
    tf.ready().then(() => {
      loadModel();
    });
  }, []);

  const methods = useForm<SensorFormData>();

  const { handleSubmit } = methods;

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await axios.post("/api/gemini", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    },
    onSuccess: (response) => {
      setRecommendation(response.recommendation);
    },
    onError: (err: AxiosError) => {
      console.error(err.response?.data);
    },
  });

  const onSubmitSensorForm = async (data: SensorFormData) => {
    if (!model) {
      return toast.error("Please try again later");
    }

    function loadImage(file: File): Promise<HTMLImageElement> {
      return new Promise((resolve, reject) => {
        const im = new Image();
        const fr = new FileReader();
        fr.onload = function () {
          im.src = fr.result as string;
        };
        fr.onerror = reject;
        fr.onloadend = () => resolve(im);
        fr.readAsDataURL(file);
      });
    }

    function preprocess(img: HTMLImageElement) {
      const tensor = tf.browser.fromPixels(img);
      const resized = tf.image.resizeBilinear(tensor, [128, 128]);
      const normalized = resized.div(tf.scalar(1));
      const batched = normalized.expandDims(0);

      return batched;
    }

    const loadedImage = await loadImage(data.gambar[0]);
    const preprocessedImage = preprocess(loadedImage);

    const prediction = model.predict(preprocessedImage);

    // @ts-ignore datasync exist, but has error type
    const predictions = prediction.dataSync();

    const predictedClassIndex = predictions.indexOf(Math.max(...predictions));
    const predictedClassName = classNames[predictedClassIndex];

    const dataTumbuhan = {
      ...data,
      gambar: predictedClassName,
    };

    const formData = serialize(dataTumbuhan);

    mutate(formData);
  };

  const handleClose = () => {
    setRecommendation("");
  };

  async function loadModel() {
    try {
      const modelURL = `${process.env.NEXT_PUBLIC_BASE_URL}/tfjs_model/model.json`;
      const model = await tf.loadLayersModel(modelURL);
      setModel(model);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <>
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmitSensorForm)}
          className="flex flex-col gap-3 w-full"
        >
          <Input
            id="nama"
            label="Nama Tumbuhan"
            placeholder="Masukkan nama tumbuhan"
            validation={{
              required: "Nama tumbuhan harus diisi",
            }}
          />
          <Input
            id="moisture"
            label="Moisture Level"
            placeholder="Masukkan moisture level"
            validation={{
              required: "Moisture level harus diisi",
            }}
          />
          <UploadImage
            id="gambar"
            label="Gambar Tumbuhan"
            maxFiles={3}
            validation={{
              required: "Gambar tumbuhan harus diisi",
            }}
          />
          <Button className="mt-2" type="submit" disabled={isPending}>
            Berikan saran!
          </Button>
        </form>
      </FormProvider>
      <Modal open={!!recommendation} onClose={handleClose}>
        <Box sx={style}>
          <div
            style={{ whiteSpace: "pre-line" }}
            dangerouslySetInnerHTML={{ __html: recommendation }}
            className="text-black"
          />
        </Box>
      </Modal>
    </>
  );
}
