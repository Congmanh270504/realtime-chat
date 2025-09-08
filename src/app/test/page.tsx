import { CreateServerDialog } from "@/components/server/create-server-dialog";
import { getServersByUserId } from "@/lib/hepper/get-servers";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import React from "react";

const Page = async () => {
  const user = await currentUser();
  if (!user) {
    return <div>Please sign in</div>;
  }

  const data = await getServersByUserId(user.id);
  console.log(data);
  return (
    <div>
      {/* <CreateServerDialog /> */}
      {data.map((server) => (
        <div key={server.id} className="p-4 border-b">
          <h2 className="text-lg font-bold">{server.serverName}</h2>
          <p className="text-sm text-gray-500">ID: {server.id}</p>
          <Image
            src={server.serverImage || "/default-server.png"}
            alt={server.serverName}
            width={50}
            height={50}
            className="rounded-lg mt-2"
          />
          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded">
            {JSON.stringify(server, null, 2)}
          </pre>
        </div>
      ))}
    </div>
  );
};

export default Page;
