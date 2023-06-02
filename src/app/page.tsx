import { prisma } from "@/db";
import Link from "next/link";

// it is better to extract away this logic into it's own function for reusability elsewhere
function getTodos() {
  // this is just some type of asynchronous code that gives you back data you can use
  return prisma.todo.findMany();
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
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-2xl">To Do List</h1>
        <Link
          className="border border-slate-300 text-slate-300 px-2 py-1 rounded hover:bg-slate-700 focus-within:bg-slate-700 outline-none"
          href="/new"
        >
          New
        </Link>
      </header>
      <ul className="pl-4">
        {todos.map((todo) => {
          return <li key={todo.id}>{todo.title}</li>;
        })}
      </ul>
    </>
  );
}
