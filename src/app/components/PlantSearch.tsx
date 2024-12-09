import Input from "@/components/form/Input";
import Typography from "@/components/Typography";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useDebounce } from "@uidotdev/usehooks";

interface PlantSearchFormData {
  plantName: string;
}

export default function PlantSearch() {
  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const methods = useForm<PlantSearchFormData>();

  const { watch } = methods;

  const plantName = watch("plantName");

  const searchParams = useDebounce(plantName, 1000);

  const { data } = useQuery({
    queryKey: ["tanaman", searchParams],
    queryFn: async () => {
      const res = await axios.get(
        "https://www.data.qld.gov.au/api/3/action/datastore_search",
        {
          params: {
            resource_id: "fd297d03-bf72-40c7-b27e-24cc7023360c",
            q: searchParams,
          },
        },
      );
      return res;
    },
    enabled: !!searchParams,
    refetchOnMount: false,
  });

  const plantData = data?.data.result.records;

  return (
    <>
      <FormProvider {...methods}>
        <form className="flex flex-col gap-3 w-full">
          <Input id="plantName" label="Plant Name" placeholder="ex: tomato" />
        </form>
      </FormProvider>

      {plantData?.length > 0 && (
        <div className="border p-4 rounded bg-white w-full mt-5">
          <Typography variant="h5">Results:</Typography>
          <ul>
            {plantData?.map((plant, index) => (
              <li key={index} className="p-2 border-b">
                <div className="flex justify-between items-center">
                  <div className="text-black">
                    <strong>
                      {plant["Common Name"] || "Nama Tidak Ditemukan"}
                    </strong>
                    <p>
                      {plant["Botanical Name"] || "Deskripsi Tidak Tersedia"}
                    </p>
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
    </>
  );
}
