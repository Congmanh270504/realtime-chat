import ActionSearchForm from "@/components/action-search-form";
import React from "react";

const Page = async () => {
  return (
    <div className="flex justify-center items-start  pt-20">
      <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <ActionSearchForm />
      </div>
    </div>
  );
};

export default Page;
