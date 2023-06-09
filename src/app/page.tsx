import { prisma } from "@/db";
import Link from "next/link";
import { ToDoItem } from "@/components/ToDoItem";
import { revalidatePath } from "next/cache";
// import { redirect } from "next/navigation";
import { VscAdd } from "react-icons/vsc";

type ToDoObject = {
  id: string;
  title: string;
  complete: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// it is better to extract away this logic into it's own function for reusability elsewhere
function getTodos() {
  // this is just some type of asynchronous code that gives you back data you can use
  return prisma.todo.findMany({ orderBy: { createdAt: "asc" } });
}

async function toggleToDo(id: string, complete: boolean) {
  "use server";

  // and in our server console we can see the id and complete values
  console.log(`Server Action toggleToDo id: ${id} complete: ${complete}`);

  // update the todo "complete" value, where the id is the same as the one passed to the function
  await prisma.todo.update({ where: { id }, data: { complete } });

  // (!) you cannot do redirects like this inside of your Server Action:
  // redirect("/");
}

async function deleteToDo(id: string) {
  "use server";

  console.log(`Server Action deleteToDo id: ${id}`);

  await prisma.todo.delete({ where: { id } });

  // revalidatePath can be used within server-side functions, such as API routes or server-side rendering (SSR) pages, to selectively revalidate specific paths.
  // When you call revalidatePath(path), where path is a string representing the path you want to revalidate, NextJS will mark that path as stale in the cache and trigger a revalidation.
  // The subsequent request for that path will result in fetching new data and updating the cache accordingly.
  // https://nextjs.org/docs/app/api-reference/functions/revalidatePath
  revalidatePath("/");
}

export default async function Home() {
  // normally you would use a fetch or a useQuery to get your "todos" data
  // with Server Components inside of NextJS13 we don't need to do any of that
  // as long as we are using the /app/ folder we have the ability to call Server Code inside of our Components
  // and it will run all of this code on the Server and send that down to the Client

  // we can make a call to prisma (remember to make the function above async)
  // const todos = await prisma.todo.findMany();

  // this is the great thing about Server Components
  // as long as your code doesn't do anything on the Client such as useState, useEffect or onChange event listeners
  // it will run ALL of your code on the Server and then send that down to the client
  // which means you can do things like call your database using prisma FROM your Component
  // and none of that Server/Database code is going to get the client
  // but the actual data like the todos is going to make it's way down to the client

  // the Server generated all the HTML and sent it down to the Client
  // the Client didn't have to do anything at all
  // the Client just recieved raw HTML and that's all it has to deal with
  // We don't have to worry about Loading states, Errror states for our fetch/Query etc.

  // temporary code to add a todo to our database
  // await prisma.todo.create({
  //   data: { title: "test to do 1", complete: false },
  // });

  // now we have extracted that logic into another function we can use it here:
  const todos = await getTodos();

  return (
    <>
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl">To Do List</h1>
        <Link
          className="flex items-center gap-2 rounded border border-slate-300 px-2 py-1 text-slate-300 outline-none focus-within:bg-slate-700 hover:bg-slate-700"
          href="/new"
        >
          <VscAdd /> New
        </Link>
      </header>
      <ul className="flex flex-col gap-4 pl-4">
        {todos.map((todo: ToDoObject) => {
          return (
            <ToDoItem
              key={todo.id}
              {...todo}
              toggleToDo={toggleToDo}
              deleteToDo={deleteToDo}
            />
          );
        })}
      </ul>
    </>
  );
}
