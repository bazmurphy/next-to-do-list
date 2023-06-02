// type the ToDoItem props
type ToDoItemProps = {
  id: string;
  title: string;
  complete: boolean;
};

// create a ToDoItem component
export function ToDoItem({ id, title, complete }: ToDoItemProps) {
  return (
    <li className="flex gap-1 items-center">
      {/* "peer" class allows us to add different styles to the label based on if the input is checked or not */}
      <input id={id} type="checkbox" className="cursor-pointer peer" />
      <label
        htmlFor={id}
        className="cursor-pointer peer-checked:line-through peer-checked:text-slate-500"
      >
        {title}
      </label>
    </li>
  );
}
