"use client";

import Button from "@/components/buttons/Button";
import Input from "@/components/form/Input";
import UploadImage from "@/components/form/UploadImage";
import Typography from "@/components/Typography";
import { ApiResponse } from "@/types/api";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";

export default function Home() {
  const methods = useForm();

  const { watch, handleSubmit } = methods;

  const { mutate: connectSensor } = useMutation({
    mutationFn: async (ip: string) => {
      const res = await axios.post("/api/sensor", {
        ip: ip,
      });
      return res.data;
    },
  });

  const { mutate } = useMutation({
    mutationFn: async () => {
      const res = await axios.post("/api/gemini");
      return res.data;
    },
  });

  const onSensorConnect = (ip: string) => {
    if (!ip) {
      return toast.error("IP harus diisi!");
    }
    connectSensor(ip);
  };

  const onSubmit = () => {
    mutate();
  };

  const ipValue = watch("ip");

  return (
    <main className="bg-slate-50 min-h-screen flex justify-center items-center">
      <div className="flex flex-col gap-10 w-2/5 justify-center items-center">
        <Typography variant="h4">Florasense</Typography>

        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-3 w-full"
          >
            <Input
              id="nama"
              label="Nama Tumbuhan"
              placeholder="Masukkan nama tumbuhan"
            />
            <div className="flex items-end gap-2">
              <Input
                id="ip"
                label="IP Sensor"
                placeholder="Masukkan ip sensor"
              />
              <Button onClick={() => onSensorConnect(ipValue)}>Connect</Button>
            </div>
            <UploadImage id="gambar" label="Gambar Tumbuhan" maxFiles={3} />
            <Button className="mt-2" type="submit">
              Berikan saran!
            </Button>
          </form>
        </FormProvider>
      </div>
    </main>
  );
}
