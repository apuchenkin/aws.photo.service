{-# LANGUAGE FlexibleInstances #-}

module Handler.Home where

import Import
import System.Directory (getDirectoryContents)
import Codec.Picture (readImage, Image (..))
import Codec.Picture.Types (dynamicMap)
import Data.Aeson (decode, encode, Object)
import Data.Aeson.Types (parseMaybe, Parser)
import Database.Persist.Sql (fromSqlKey)
import Data.Time.Format (readTime)
import qualified Data.Text as T (replace)
import Data.Aeson ((.:?))

-- This is a handler function for the GET request method on the HomeR
-- resource pattern. All of your resource patterns are defined in
-- config/routes
--
-- The majority of the code you will write in Yesod lives in these handler
-- functions. You can spread them across multiple files if you are so
-- inclined, or create a single monolithic file.
getHomeR :: Handler Value
getHomeR = do
     returnJson ()

getInstallR :: Handler Value
getInstallR = do
     let path = "static/gallery/src/"
     srcs <- liftIO $ getDirectoryContents path
     ids <- sequence $ map (createPhoto path) srcs
     returnJson ids
     where
     createPhoto :: String -> String -> Handler (Maybe (Key Photo))
     createPhoto srcPath = \ name -> do
        let src = srcPath ++ name
        mImage <- liftIO $ readImage src
        pid <- either (\_ -> return Nothing) (\image -> do
           let thumbPath = "static/gallery/thumb/"
           let thumb = Just $ thumbPath ++ name
           let width  = dynamicMap imageWidth  image
           let height = dynamicMap imageHeight image
           let photo = Photo name src thumb width height "" 0 Nothing Nothing Nothing
           photoId <- runDB $ insert photo
           return $ Just photoId) mImage
        return pid

getInstallExifR :: Handler Value
getInstallExifR = do
    exifFile <- liftIO $ readFile "exif.json"
    let maybeExif = decode exifFile :: Maybe [Object]
    case maybeExif of
        Nothing -> invalidArgs ["category"]
        Just exif -> do
            ids <- sequence $ map createPhoto exif
            returnJson ids
            where
                createPhoto :: Object -> Handler (Maybe (Key Photo))
                createPhoto obj = do
                    categories <- fromMaybe (return []) $ flip parseMaybe obj $ \o -> do
                         categories <- o  .: "IPTC:Keywords"  :: Parser [Text]
                         return $ sequence $ flip map categories $ \title -> do
                            let normalizedTitle = unpack $ T.replace " " "-" (toLower title)
                            ecid <- runDB $ insertBy $ Category normalizedTitle Nothing
                            let cid = either entityKey id ecid
                            _    <- runDB $ insertUnique $ Translation En CategoryType (fromSqlKey cid) "title" (unpack $ title)
                            return cid

                    maybePhoto <- fromMaybe (return Nothing) $ flip parseMaybe obj $ \o -> do
                         name           <- o  .:  "File:FileName" :: Parser String
                         src            <- o  .:  "SourceFile"
                         width          <- o  .:  "File:ImageWidth"
                         height         <- o  .:  "File:ImageHeight"
                         dir            <- o  .:  "File:Directory"
                         author         <- o  .:? "EXIF:Artist"
                         caption        <- o  .:? "IPTC:Caption-Abstract"
                         dateString     <- o  .:? "EXIF:CreateDate"

                         let thumb  = Just (dir ++ "/thumb/" ++ name)
                         let exifData = toStrict $ decodeUtf8 $ encode obj
                         let datetime = flip fmap dateString $ \ds -> readTime defaultTimeLocale "%Y:%m:%d %H:%I:%S" ds :: UTCTime
                         let insertPhoto = do
                              aid <- maybe (return Nothing) persistAuthor author
                              let photo = Photo name src thumb width height exifData 0 aid datetime Nothing
                              pid <- runDB $ insert photo
                              _   <- maybe (return Nothing) (persistTranslation pid) caption
                              return $ Just pid
                              where
                                persistAuthor :: String -> Handler (Maybe (Key Author))
                                persistAuthor a = do
                                  eaid <- runDB $ insertBy $ Author a
                                  return $ Just (either entityKey id eaid)

                                persistTranslation :: Key Photo -> String -> Handler (Maybe (Key Translation))
                                persistTranslation pid c = runDB $ insertUnique $ Translation En PhotoType (fromSqlKey pid) "caption" c

                         return insertPhoto

                    case maybePhoto of
                        Just pid -> do
                            _ <- sequence $ flip map categories $ \cid -> runDB $ insertUnique $ PhotoCategory cid pid
                            return $ Just pid
                        Nothing ->
                            return Nothing



