"use client";

// type the ToDoItem props
type ToDoItemProps = {
  id: string;
  title: string;
  complete: boolean;
  toggleToDo: (id: string, complete: boolean) => void;
};

// create a ToDoItem component
export function ToDoItem({ id, title, complete, toggleToDo }: ToDoItemProps) {
  return (
    <li className="flex gap-1 items-center">
      {/* "peer" class allows us to add different styles to the label based on if the input is checked or not */}
      <input
        id={id}
        type="checkbox"
        // we set the defaultChecked property to the "complete" boolean
        defaultChecked={complete}
        onChange={(event) => toggleToDo(id, event.target.checked)}
        className="cursor-pointer peer"
      />
      <label
        htmlFor={id}
        className="cursor-pointer peer-checked:line-through peer-checked:text-slate-500"
      >
        {title}
      </label>
    </li>
  );
}
