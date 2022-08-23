import * as model from './model.js'
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import PaginationView from './views/pageinationView.js';
import pageinationView from './views/pageinationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';


import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { MODAL_CLOSE_SEC } from './config.js';

if (module.hot) {
  module.hot.accept();
}

const showRecipe = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();

    // 0) Update results view to mark selected search result
    resultsView.render(model.getSearchResultsPage());

    // 1) Updating bookmarks view
    bookmarksView.update(model.state.bookmarks);

    // 2) Loadeing recipe
    await model.loadRecipe(id);

    // 3) Rending recipe
    recipeView.render(model.state.recipe);


  } catch (err) {
    recipeView.renderError();
    console.error(err)
  };
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    //1) Get search query
    const query = searchView.getQuery();
    if (!query) return;

    // 2) Load search results
    await model.loadSearchResult(query);

    // 3) Render result
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage());
    // 4) Render initial pagination buttons
    PaginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  };
};

const controlPagination = function (goToPage) {
  // 3) Render New result
  resultsView.render(model.getSearchResultsPage(goToPage));
  // 4) Render New pagination buttons
  PaginationView.render(model.state.search);
};

const conrolServings = function (newServings) {
  // Update the recipe servings (in state) 
  model.updateServings(newServings);
  // Update the recipe view 
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
}

const controlBookmark = function () {
  // 1) Add/Remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // 2) Update recipe view
  recipeView.update(model.state.recipe);

  // 3) Render bookmarks
  bookmarksView.render(model.state.bookmarks);
}

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // Show loading spinner
    addRecipeView.renderSpinner();

    // Upload the new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    // Render recipe
    recipeView.render(model.state.recipe);

    // Success message
    addRecipeView.renderMessage();

    // Render bookmark view
    bookmarksView.render(model.state.bookmarks);

    // Change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // Close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000)
  } catch (err) {
    console.error(err);
    addRecipeView.renderError(err.message);
  };
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks)
  recipeView.addHandlerRender(showRecipe);
  recipeView.addHandlerUpdateServings(conrolServings);
  recipeView.addHandlerAddBookmark(controlBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  pageinationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init()
