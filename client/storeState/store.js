import { create } from 'zustand';


const useStore = create((set) => ({
    // Global state properties for the Recipe Recommender
    cookingTime: '',
    mealType: '',
    dietType: '',
    servings: 1,
    selectedIngredients: [],

    //Functions to update the state
    setCookingTime: (time) => set({ cookingTime: time }),
    setMealType: (meal) => set({ mealType: meal }),
    setDietType: (diet) => set({ dietType: diet }),
    setServings: (servings) => set({ servings }),
    addIngredients: (ingredient) =>
        set((state) => ({
            selectedIngredients: state.selectedIngredients.includes(ingredient)
                ? state.selectedIngredients
                : [...state.selectedIngredients, ingredient],
        })),
    removeIngredient: (ingredient) =>
        set((state) => ({
            selectedIngredients: state.selectedIngredients.filter((ing) => ing !== ingredient),
        })),

}));

export default useStore;



