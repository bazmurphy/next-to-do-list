import { prisma } from "@/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { VscCheck, VscClose } from "react-icons/vsc";

export default function Page() {
  // the great thing about Server Actions inside NextJS13 is they are built on top of the normal browser primitives
  // this is really good because if the JavaScript on the page is disabled everything will still work (without the bells & whistles)
  // and its built on things we are already used to for example with Forms

  // our form will not do anything until we hook it up to a Server Action
  // and the way a Server Action works is you create a function

  // it must be async (that is really important)
  // it takes the normal javascript FormData
  async function createToDo(data: FormData) {
    // to run this function on the server you need to add "use server" as a string at the top of the function
    // it is saying "this function is server code and it will never run on the client, it only ever runs on the server"
    "use server"; // (!) we must set experimental: { serverActions: true } in our next.config.js

    console.log("Testing Server Actions createToDo");

    // we use the form data get method to get the value of the input with the name "title"
    const title = data.get("title")?.valueOf();

    // input validation & error handling
    if (typeof title !== "string" || title.length === 0) {
      throw new Error("Invalid title");
    }

    // we create a new todo in the database with prisma
    await prisma.todo.create({ data: { title: title, complete: false } });

    // and then redirect (using the NextJS function) back to the home page
    redirect("/");
  }

  return (
    <>
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl">New To Do Item</h1>
      </header>
      {/* we add the Server Action function to the form action= */}
      <form action={createToDo} className="flex flex-col gap-2">
        {/* the name="title" is really important because we are going to use that inside of our Server Action */}
        <input
          type="text"
          name="title"
          className="rounded border border-slate-300 bg-transparent px-2 py-1 outline-none focus-within:border-slate-100"
        />
        <div className="flex justify-end gap-1">
          <Link
            href=".."
            className="flex items-center gap-2 rounded border border-slate-300 px-2 py-1 text-slate-300 outline-none focus-within:bg-slate-700 hover:bg-slate-700"
          >
            <VscClose />
            Cancel
          </Link>
          <button
            type="submit"
            className="flex items-center gap-2 rounded border border-slate-300 px-2 py-1 text-slate-300 outline-none focus-within:bg-slate-700 hover:bg-slate-700"
          >
            <VscCheck />
            Create
          </button>
        </div>
      </form>
    </>
  );
}
