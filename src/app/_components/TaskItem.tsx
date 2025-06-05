interface Task {
  id: number;
  title: string;
  description: string;
  date: string;
}

interface TaskItemProps {
  task: Task;
}

export const TaskItem = ({ task }: TaskItemProps) => {
  return (
    <div className="mx-4 mb-2 cursor-pointer rounded-lg p-4 hover:bg-gray-100">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">{task.title}</h3>
        <span className="text-sm text-gray-500">{task.date}</span>
      </div>
      <p className="mt-1 line-clamp-2 text-sm text-gray-500">
        {task.description}
      </p>
    </div>
  );
};
