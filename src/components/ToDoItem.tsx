"use client";

import { VscTrash } from "react-icons/vsc";

// type the ToDoItem props
type ToDoItemProps = {
  id: string;
  title: string;
  complete: boolean;
  createdAt: Date;
  toggleToDo: (id: string, complete: boolean) => void;
  deleteToDo: (id: string) => void;
};

// create a ToDoItem component
export function ToDoItem({
  id,
  title,
  complete,
  createdAt,
  toggleToDo,
  deleteToDo,
}: ToDoItemProps) {
  return (
    <li className="flex items-center gap-3">
      {/* "peer" class allows us to add different styles to the label based on if the input is checked or not */}
      <input
        id={id}
        type="checkbox"
        // we set the defaultChecked property to the "complete" boolean
        defaultChecked={complete}
        onChange={(event) => toggleToDo(id, event.target.checked)}
        className="peer h-4 w-4 cursor-pointer"
      />
      <label
        htmlFor={id}
        className="text-l cursor-pointer peer-checked:text-slate-500 peer-checked:line-through"
      >
        {title}
      </label>
      <span className="text-xs text-slate-400">
        {dateTimeFormatter.format(createdAt)}
      </span>
      <button
        className="text-slate-400 outline-none focus-within:text-slate-200 hover:text-slate-200"
        onClick={() => deleteToDo(id)}
      >
        <VscTrash />
      </button>
    </li>
  );
}

// format the date time for createdAt
const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "short",
  timeStyle: "short",
});
