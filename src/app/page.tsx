"use client";

import Typography from "@/components/Typography";
import { useState } from "react";
import PlantSearch from "@/app/components/PlantSearch";
import PlantAdd from "@/app/components/PlantAdd";
import Button from "@/components/buttons/Button";

export default function Home() {
  const [page, setPage] = useState(1);

  return (
    <main className="bg-slate-50 min-h-screen flex justify-center items-center py-20">
      <div className="flex flex-col gap-10 w-2/5 justify-center items-center">
        <Typography variant="h4">Florasense</Typography>

        <div className="flex flex-row items-center gap-5">
          <Button
            onClick={() => {
              setPage(1);
            }}
            disabled={page === 1}
          >
            Cari Tanaman
          </Button>
          <Button
            onClick={() => {
              setPage(2);
            }}
            disabled={page === 2}
          >
            Tambah Tanaman
          </Button>
        </div>

        {page === 1 ? <PlantSearch /> : <PlantAdd />}
      </div>
    </main>
  );
}
