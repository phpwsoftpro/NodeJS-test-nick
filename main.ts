import {
    GetProductsForIngredient,
    GetRecipes,
} from "./supporting-files/data-access";
import { NutrientFact, Product, Recipe } from "./supporting-files/models";
import {
    GetCostPerBaseUnit,
    GetNutrientFactInBaseUnits,
} from "./supporting-files/helpers";
import { RunTest, ExpectedRecipeSummary } from "./supporting-files/testing";

console.clear();
console.log("Expected Result Is:", ExpectedRecipeSummary);

const recipeData = GetRecipes(); // the list of 1 recipe you should calculate the information for
let recipeSummary: any = {}; // the final result to pass into the test function

/*
 * YOUR CODE GOES BELOW THIS, DO NOT MODIFY ABOVE
 * (You can add more imports if needed)
 * */

const getNutrientsCheapestArray = (nutrientsData: any) => {
    let nutrientsCheapestArray = nutrientsData.reduce(
        (last: NutrientFact[], current: NutrientFact) => {
            const found = last.find(
                (nutrient: NutrientFact) => nutrient.nutrientName == current.nutrientName
            );
            if (found) {
                found.quantityAmount.uomAmount += current.quantityAmount.uomAmount;
            } else {
                last.push(current);
            }
            return last;
        },
        []
    );

    nutrientsCheapestArray.sort((a: any, b: any) => b.quantityAmount.uomAmount - a.quantityAmount.uomAmount);

    return nutrientsCheapestArray;
}
const getProductsCostPerBaseUnit = (products: Product[]) => {
    return products.map((product) => {
        const nutrientFacts = product.nutrientFacts.map((n) =>
            GetNutrientFactInBaseUnits(n)
        );
        const costPerBaseUnit = product.supplierProducts.map((s) =>
            GetCostPerBaseUnit(s)
        );
        return {
            costPerBaseUnit: Math.min(...costPerBaseUnit),
            nutrientFacts,
        };
    });
};

const getSortedCost = (productsCostPerBaseUnit: any) => {
    const sortedProductsCostPerBaseUnit = productsCostPerBaseUnit.reduce(
        (last: any, current: any) => {
            return last &&
                current.costPerBaseUnit < last.costPerBaseUnit
                ? current
                : last;
        }
    );
    return sortedProductsCostPerBaseUnit;
};

const checkRecipie = (recipe: Recipe) => {
    const recipeName = recipe.recipeName;
    recipeSummary[recipeName] = {};
    let cheapPrice = 0;
    let nutrientsData: NutrientFact[] = [];

    for (const lineItem of recipe.lineItems) {
        const productsForIngredient = GetProductsForIngredient(lineItem.ingredient);
        const productsCostPerBaseUnit = getProductsCostPerBaseUnit(productsForIngredient);
        let sortedCostAndNutritons = getSortedCost(productsCostPerBaseUnit);

        sortedCostAndNutritons.nutrientFacts.forEach((nutrient: NutrientFact) =>
            nutrientsData.push(nutrient)
        );
        cheapPrice =
            cheapPrice +
            sortedCostAndNutritons.costPerBaseUnit * lineItem.unitOfMeasure.uomAmount;
    }

    const nutrientsCheapestArray = getNutrientsCheapestArray(nutrientsData);
    let sortedNutrientsCheapestArray = {};
    for (const nutrientsSorted of nutrientsCheapestArray) {
        sortedNutrientsCheapestArray[nutrientsSorted.nutrientName] = nutrientsSorted;
    }

    const finalData = {
        [recipeName]: {
            cheapestCost: cheapPrice,
            nutrientsAtCheapestCost: sortedNutrientsCheapestArray,
        },
    };
    console.log("Output Result Is:", finalData);
    return finalData;
};

const calculateResults = (recipeData: Recipe[]) => {
    // for (const recipe of recipeData) {
    //     checkRecipie(recipe);
    // }
    return checkRecipie(recipeData[0]);

};

recipeSummary = calculateResults(recipeData);

/*
 * YOUR CODE ABOVE THIS, DO NOT MODIFY BELOW
 * */
RunTest(recipeSummary);
