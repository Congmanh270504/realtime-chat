import ActionSearchForm from "@/components/action-search-form";
import Silk from "@/components/Silk";
import React from "react";

const Page = () => {
  return (
    <>
      <Silk
        speed={5}
        scale={1}
        color="#5227FF"
        noiseIntensity={1.5}
        rotation={0}
      />
      <div className="absolute  inset-0 flex justify-center items-start pt-20">
        <div className="flex justify-center items-start pt-20">
          <div className="w-full max-w-md mx-auto p-6 rounded-lg shadow-lg">
            <ActionSearchForm />
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
