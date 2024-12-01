import React from "react";

type ClassType = {
  id: string;
  class_name: string;
  color: string;
};

interface ClassTypeWidgetProps {
  classTypes: ClassType[];
  selectedClassType: ClassType | null;
  onSelect: (classType: ClassType) => void;
  onCreateNew: () => void;
}

const ClassTypeWidget: React.FC<ClassTypeWidgetProps> = ({
  classTypes,
  selectedClassType,
  onSelect,
  onCreateNew,
}) => {
  return (
    <div className="class-type-widget bg-gray-900 text-white p-6 rounded-3xl shadow-md w-1/2 h-32 flex flex-col justify-between">
      <h3 className="text-lg font-semibold mb-2">Class Types</h3>
      <ul className="flex flex-wrap items-center space-x-4">
        {classTypes.map((classType) => (
          <li
            key={classType.id}
            onClick={() => onSelect(classType)}
            className={`cursor-pointer px-2 py-1 rounded-full border-2 ${
              selectedClassType?.id === classType.id
                ? `border-${classType.color} bg-${classType.color} text-white`
                : "border-transparent"
            } transition-all duration-300 ease-in-out`}
            style={{
              borderColor: classType.color,
              color: selectedClassType?.id === classType.id ? "white" : classType.color,
            }}
          >
            {classType.class_name}
          </li>
        ))}
        <li
          className="cursor-pointer text-blue-300 hover:text-blue-500 transition"
          onClick={onCreateNew}
        >
          + create new class type
        </li>
      </ul>
    </div>
  );
};

export default ClassTypeWidget;
