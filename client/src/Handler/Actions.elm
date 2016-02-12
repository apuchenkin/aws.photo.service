module Handler.Actions where

import Http
import Either exposing (Either (..))
import Dict exposing (Dict)
import Json.Decode  as Json exposing ((:=))
import Effects exposing (Never)
import Task exposing (Task)
import Lib.Types exposing (WithRouter, Action, Response (..), Router (..))
import Handler.Routes as Routes exposing (Route)
import Lib.Helpers exposing (noFx, chainAction)
import Maybe.Extra exposing (join)
import Handler.Locale as Locale exposing (Locale)

type alias Promise value = Either (Task Http.Error value) value

type alias Meta = {
    title: String
  }

type alias State = WithRouter Route
  {
    meta: Meta,
    locale: Locale,
    categories: Dict String Category,
    photos: List Photo,
    photo: Maybe Photo,
    isLoading: Bool
  }

-- type ParentCategory =
type Category = Category {
    id: Int,
    name: String,
    title: String,
    parent: Maybe (Either Int Category)
  }

type alias Photo = {
  id: Int,
  src: String,
  width: Int,
  height: Int
}

-- author: {name: "Artem Puchenkin"}
-- caption: "На тропе идущей к кемпингу Пaйне-Гранде (Campamento Paine Grande), национального парка Торрес-дель-Пайне, Патагония, Чили"
-- datetime: "2014-12-30T17:00:53.000Z"
-- height: 1600
-- id: 82
-- name: "DSCF2765.jpg"
-- src: "static/src/chile/DSCF2765.jpg"
-- views: 96
-- width: 2423


-- Category constuctor
category : Int -> String -> String -> Maybe (Either Int Category) -> Category
category id name title parent = Category {id = id, name = name, title = title, parent = parent}

getCategory : State -> Maybe Category
getCategory state =
  let
    param = case Dict.get "subcategory" state.router.params of
      Nothing -> Dict.get "category" state.router.params
      c -> c
  in join <| Maybe.map (flip Dict.get state.categories) param

decodeCategories : Json.Decoder (List Category)
decodeCategories = Json.list <| Json.object4 category
  ("id"     := Json.int)
  ("name"   := Json.string)
  ("title"  := Json.string)
  (Json.maybe ("parent" := Json.map Left Json.int))

decodePhoto : Json.Decoder Photo
decodePhoto = Json.object4 Photo
  ("id"     := Json.int)
  ("src"    := Json.string)
  ("width"  := Json.int)
  ("height" := Json.int)

decodePhotos : Json.Decoder (List Photo)
decodePhotos = Json.list decodePhoto

getRequest: Json.Decoder value -> String -> State -> Task Http.Error value
getRequest decoder url state = Http.fromJson decoder (Http.send Http.defaultSettings
  { verb = "GET"
  , headers = [("Accept-languadge", Locale.toString state.locale)]
  , url = url
  , body = Http.empty
  })

loadCategories : Router Route State -> Action State
loadCategories router state =
  let
    -- _ = Debug.log "loadCategories" state
    fetch = Task.toMaybe <| getRequest decodeCategories "/api/v1/category" state
    task = fetch `Task.andThen` \mcategories ->
      let
        categories = Maybe.withDefault [] mcategories
        update = updateCategories categories
        categoryParam =  case Dict.get "subcategory" state.router.params of
            Nothing -> Dict.get "category" state.router.params
            c -> c
        -- _ = Debug.log "categoryParam" state.router
        action = Maybe.withDefault update <| flip Maybe.map categoryParam <| \category ->
          update `chainAction` (loadPhotos router)
      in Task.succeed <| action --case state.router.route of
        -- Just (Routes.Category) ->
        -- Just (Routes.Photo)    -> update `chainAction` loadPhotos
        -- _ -> update

  in Response ({state | isLoading = True}, Effects.task task)

loadPhotos : Router Route State -> Action State
loadPhotos (Router router) state =
  let
    -- _ = Debug.log "loadPhotos" state
    task = case Dict.isEmpty state.categories of
      True   -> Nothing
      False  ->
        let
          category = getCategory state
          fetch = flip Maybe.map category <| \(Category c) ->
            let fetch = Task.toMaybe <| getRequest decodePhotos ("/api/v1/category/" ++ toString c.id ++ "/photo") state
            in fetch `Task.andThen` \photos -> Task.succeed <| updatePhotos <| Maybe.withDefault [] photos

        in Just <| Maybe.withDefault (Task.succeed <| router.forward (Routes.NotFound, Dict.empty)) fetch

  in Response ({state | isLoading = True}, Maybe.withDefault Effects.none <| Maybe.map Effects.task task)

loadPhoto : Action State
loadPhoto state =
  let
    photoId = Dict.get "photo" state.router.params
    task = flip Maybe.map photoId <| \pid ->
      let fetch = Task.toMaybe <| getRequest decodePhoto ("/api/v1/photo/" ++ pid) state
      in fetch `Task.andThen` \photo -> Task.succeed <| updatePhoto photo

  in Response ({state | isLoading = True}, Maybe.withDefault Effects.none <| Maybe.map Effects.task task)

updatePhotos : List Photo -> Action State
updatePhotos photos state = Response <| noFx {state | isLoading = False, photos = photos}

updatePhoto : Maybe Photo -> Action State
updatePhoto photo state = Response <| noFx {state | isLoading = False, photo = photo}

updateCategories : List Category -> Action State
updateCategories categories state =
  let
    -- _ = Debug.log "updateCategories" state
    dict  = Dict.fromList   <| List.map (\(Category c) -> (c.name, c)) categories
    dict' = Dict.fromList   <| List.map (\(Category c) -> (c.id, c))   categories

    castegoris' = Dict.map (\name category -> Category {category | parent = Maybe.map (\p ->
      case p of
        Right _ -> p
        Left  pidx -> case (Dict.get pidx dict') of
          Nothing -> p
          Just p' -> Right <| Category p'
      ) category.parent}) dict
  in
    Response <| noFx {state | isLoading = False, categories = castegoris'}

setLocale : Router Route State -> Action State
setLocale (Router router) state =
  let
    _ = Debug.log "locale" locale
    locale = Dict.get "locale" router.getParams
    route = Maybe.withDefault Routes.Home router.getRoute
    act = case locale of
      Nothing -> router.forward (route, Dict.fromList [("locale", Locale.toString state.locale)])
      Just l  -> \state -> Response <| noFx {state | locale = Locale.fromString l}

  in act state
