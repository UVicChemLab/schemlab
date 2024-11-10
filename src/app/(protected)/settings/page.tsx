import React from "react";
import { auth, signOut } from "~/server/auth";
const page = async () => {
  const session = await auth();
  return (
    <div>
      <h5>{JSON.stringify(session)}</h5>
      <form
        action={async (formData) => {
          "use server";
          await signOut();
        }}
      >
        <button type="submit">Sign out</button>
      </form>
    </div>
  );
};

export default page;
