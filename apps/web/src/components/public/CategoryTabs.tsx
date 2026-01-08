  import { Category } from "@/types/category.types";

  interface CategoryTabsProps {
    categories: Category[];
    selectedCategoryId: string | null;
    onSelectCategory: (categoryId: string | null) => void;
  }

  export function CategoryTabs({
    categories,
    selectedCategoryId,
    onSelectCategory,
  }: CategoryTabsProps) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2">
        {/* All Categories Tab */}
        <button
          onClick={() => onSelectCategory(null)}
          className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
            selectedCategoryId === null
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          Todos
        </button>

        {/* Category Tabs */}
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              selectedCategoryId === category.id
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    );
  }