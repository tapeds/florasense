import Button from "@/components/buttons/Button";
import Input from "@/components/form/Input";
import UploadImage from "@/components/form/UploadImage";

import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";

interface SensorFormData {
  ip: string;
  nama: string;
  gambar: File[];
}

export default function PlantAdd() {
  const sensorMethods = useForm<SensorFormData>();

  const { watch: watchSensor, handleSubmit: handleSensorSubmit } =
    sensorMethods;

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

  const onSubmitSensorForm = handleSensorSubmit(() => {
    mutate();
  });

  const ipValue = watchSensor("ip");

  return (
    <FormProvider {...sensorMethods}>
      <form
        onSubmit={onSubmitSensorForm}
        className="flex flex-col gap-3 w-full"
      >
        <Input
          id="nama"
          label="Nama Tumbuhan"
          placeholder="Masukkan nama tumbuhan"
        />
        <div className="flex items-end gap-2">
          <Input id="ip" label="IP Sensor" placeholder="Masukkan ip sensor" />
          <Button onClick={() => onSensorConnect(ipValue)}>Connect</Button>
        </div>
        <UploadImage id="gambar" label="Gambar Tumbuhan" maxFiles={3} />
        <Button className="mt-2" type="submit">
          Berikan saran!
        </Button>
      </form>
    </FormProvider>
  );
}
