import Button from "@/components/buttons/Button";
import Input from "@/components/form/Input";
import UploadImage from "@/components/form/UploadImage";
import Typography from "@/components/Typography";
import { Box } from "@mui/material";
import Modal from "@mui/material/Modal";

import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

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

type SensorFormPayloadProps = {
  moisture: string;
  nama: string;
  gambar: string;
};

export default function PlantAdd() {
  const [recommendation, setRecommendation] = useState("");

  const methods = useForm<SensorFormData>();

  const { handleSubmit } = methods;

  const toBase64 = (file: File) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();

      fileReader.readAsDataURL(file);

      fileReader.onload = () => {
        resolve(fileReader.result);
      };

      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: SensorFormPayloadProps) => {
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
    const base64Gambar = await toBase64(data.gambar[0]);

    const dataTumbuhan = {
      ...data,
      gambar: base64Gambar as string,
    };

    mutate(dataTumbuhan);
  };

  const handleClose = () => {
    setRecommendation("");
  };

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
          <Typography variant="p" className="text-black">
            {recommendation}
          </Typography>
        </Box>
      </Modal>
    </>
  );
}
