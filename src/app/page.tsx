"use client";

import Button from "@/components/buttons/Button";
import Input from "@/components/form/Input";
import UploadImage from "@/components/form/UploadImage";
import Typography from "@/components/Typography";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { FormProvider, useForm, SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";
import { useState } from "react";

interface PlantSearchFormData {
  plantName: string;
}

interface SensorFormData {
  ip: string;
  nama: string;
  gambar: File[];
}

export default function Home() {
  const plantSearchMethods = useForm<PlantSearchFormData>(); 
  const sensorMethods = useForm<SensorFormData>(); 
  const { watch: watchSensor, handleSubmit: handleSensorSubmit } = sensorMethods;

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

  const [plantData, setPlantData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSensorConnect = (ip: string) => {
    if (!ip) {
      return toast.error("IP harus diisi!");
    }
    connectSensor(ip);
  };

  const onSubmitPlantSearch: SubmitHandler<PlantSearchFormData> = async (data) => {
    setLoading(true);
    setError(null);
    setPlantData([]);
  
    try {
      const response = await axios.get(
        "https://www.data.qld.gov.au/api/3/action/datastore_search",
        {
          params: {
            resource_id: "fd297d03-bf72-40c7-b27e-24cc7023360c",
            q: data.plantName,
          },
        }
      );
  
      if (response.data?.result?.records?.length > 0) {
        console.log("Records:", response.data.result.records); 
        setPlantData(response.data.result.records); 
      } else {
        setError("No results found for the given plant name.");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("An error occurred while fetching the data.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmitSensorForm = handleSensorSubmit((data) => {
    mutate();
  });

  const ipValue = watchSensor("ip");

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <main className="bg-slate-50 min-h-screen flex justify-center items-center">
      <div className="flex flex-col gap-10 w-2/5 justify-center items-center">
        <Typography variant="h4">Florasense</Typography>

        <FormProvider {...plantSearchMethods}>
          <form
            onSubmit={plantSearchMethods.handleSubmit(onSubmitPlantSearch)}
            className="flex flex-col gap-3 w-full"
          >
            <Input
              id="plantName"
              label="Plant Name"
              placeholder="ex: tomato"
            />
            <Button className="mt-2" type="submit">
              Search
            </Button>
          </form>
        </FormProvider>

        {loading && <p>Loading...</p>}

        {error && <p className="text-red-500">{error}</p>}

        {plantData.length > 0 && (
          <div className="border p-4 rounded bg-white w-full mt-5">
            <Typography variant="h5">Results:</Typography>
            <ul>
              {plantData.map((plant, index) => (
                <li key={index} className="p-2 border-b">
                  <div className="flex justify-between items-center">
                    <div className="text-black">
                      <strong>{plant["Common Name"] || "Nama Tidak Ditemukan"}</strong>
                      <p>{plant["Botanical Name"] || "Deskripsi Tidak Tersedia"}</p>
                    </div>
                    <button
                      className="text-blue-500 underline"
                      onClick={() => toggleExpand(index)}
                    >
                      {expandedIndex === index ? "Collapse" : "Read more"}
                    </button>
                  </div>
                  {expandedIndex === index && (
                    <div className="mt-2 text-black">
                      <table className="w-full text-left border-collapse border border-gray-300">
                        <tbody>
                          {Object.entries(plant).map(([key, value]) => (
                            <tr key={key}>
                              <th className="border px-2 py-1 text-gray-600 font-medium">
                                {key}
                              </th>
                              <td className="border px-2 py-1">
                                {value || "Unknown"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

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
