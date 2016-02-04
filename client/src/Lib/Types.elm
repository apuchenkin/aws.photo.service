module Lib.Types (ActionEffects, Response (..), Action, Handler, RouteConfig, RouterResult, RouterState (..),
                  GetRouteConfig, WithRouter, RouterConfig, Router (..), Transition) where

import Html           exposing (Html)
import Task           exposing (Task)
import Effects        exposing (Effects, Never)
import MultiwayTree   exposing (Tree, Forest)

-----------------------------------------
-- State
-----------------------------------------

type alias ActionEffects state = Effects (Action state)

type Response state = Response (state, ActionEffects state)

type alias Action state = state -> Response state

type alias Handler state = {
    view    : Signal.Address (Action state) -> state -> Maybe Html -> Maybe Html
  , inputs  : List (Action state)
  }

type alias RouteConfig state = {
      url:          String
    , handler:      Handler state
  }

type alias RouterResult state =
    { html  : Signal Html
    , state : Signal state
    -- , tasks : Signal (Task.Task Never (List ()))
    , tasks : Signal (Task Never ())
    }

type RouterState route = RouterState {
    route:    Maybe route,
    params:   List (String, String)
  }

-----------------------------------------
-- Route
-----------------------------------------

type alias GetRouteConfig route state = route -> RouteConfig state

{-| Type extension for the model. -}
type alias WithRouter route state = { state | router : RouterState route }

type alias RouterConfig route state = {
  init:       state,
  config:     GetRouteConfig route state,
  routes:     Forest route,
  inputs:     List (Signal.Signal (Action state))
}

type Router route state = Router {
  config        : RouterConfig route state,
  state         : RouterState route,
  matchRoute    : String -> Maybe (route, List (String, String)),
  bindForward   : route -> List Html.Attribute -> List Html.Attribute,
  buildUrl      : route -> String,
  getHandlers   : Maybe route -> route -> List (Handler state),
  setRoute      : route -> Action state,
  forward       : route -> Action state
}

type alias Transition route state = Maybe route -> route -> Action state

--------------------------------------------------------------------------------