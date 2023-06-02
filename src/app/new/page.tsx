import Link from "next/link";

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
  }

  return (
    <>
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-2xl">New To Do Item</h1>
      </header>
      {/* we add the Server Action function to the form action= */}
      <form action={createToDo} className="flex gap-2 flex-col">
        {/* the name="title" is really important because we are going to use that inside of our Server Action */}
        <input
          type="text"
          name="title"
          className="border border-slate-300 bg-transparent rounded px-2 py-1 outline-none focus-within:border-slate-100"
        />
        <div className="flex gap-1 justify-end">
          <Link
            href=".."
            className="border border-slate-300 text-slate-300 px-2 py-1 rounded hover:bg-slate-700 focus-within:bg-slate-700 outline-none"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="border border-slate-300 text-slate-300 px-2 py-1 rounded hover:bg-slate-700 focus-within:bg-slate-700 outline-none"
          >
            Create
          </button>
        </div>
      </form>
    </>
  );
}
