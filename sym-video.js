/* Todo
1. Get an icon for symbol

*/

/*
To get a cursor, we need to use a trend symbol
This implies that it is really hard to go from trend data into text data as in final names
If we want to know the next or previous video file names, they must have an easy pattern such as:
Prefix{{number}}.mov
and the {{number}} is what is stored in tags
*/
(function (PV) {
    'use strict';
    class movieVis extends PV.SymbolBase {
        constructor() { super() }

        init(scope, elem, log) {
            scope.video = document.querySelector("video");

            var DateTime = luxon.DateTime;

            const LocaleFormat = "M/d/yyyy h:mm:ss a";

            function findMovieIndex(movieDetails, CursorPositions) {
                for (var index = 0; index < movieDetails.length; index++) {
                    if (movieDetails[index].x >= CursorPositions[0]) {
                        return index - 1
                    }
                }
            }

            function xToSeconds(x_diff, scale) {
                return (x_diff * scale) / 100
            }

            scope.video.addEventListener(
                "loadeddata",
                function () {
                    // Video is loaded and can be played
                    scope.video.play()
                    scope.video.currentTime = scope.currentOffset ? scope.currentOffset : 0
                    scope.video.pause()
                },
                false
            );


            //Allow for cursor                
            var options = angular.merge({
                cursor: true,               // allow cursor gestures and data requests
            }, scope.runtimeData.options)

            scope.runtimeData.options = options
            scope.runtimeData.allowCursor = true
            scope.currentlyLoadedMovie = -1
            this.onConfigChange = newConfig => {
                if (!newConfig) { return }
                // The refresh interval might have been updated, so refresh the symbol an create a new timer
                console.log(newConfig)
            };

            this.onDataUpdate = newData => {
                //console.log(newData)
                if (!newData) { return }
                console.log(newData);

                const startTimeDT = DateTime.fromFormat(newData.StartTime, LocaleFormat);
                const endTimeDT = DateTime.fromFormat(newData.EndTime, LocaleFormat);
                const diff = endTimeDT.diff(startTimeDT, ["seconds"]);
                
                const xy = newData.Traces[0].LineSegments[0]
                    .split(" ")
                    .map((point) => point.split(","));
                
                var movieDetails = [];
                
                // if no cursors, do not proceed
                if (!newData.Traces[0].CursorValues) {
                    console.log("need to specify a cursor to load video")
                    return
                }
                scope.currentMovie = parseInt(newData.Traces[0].CursorValues[0])
                // Notice that sometime the array will end with 100,100 100,100
                // This breaks looping afterwards
                if (xy[xy.length - 1] == xy[xy.length - 2]) {
                    xy.pop()
                }
                
                for (var i = 0; i < xy.length-1; i += 2) {
                    const y = xy[i][1];
                    const x = xy[i][0];
                    const x_next = xy[i + 1][0];
                    const duration_raw = x_next - x;
                    const duration_seconds = xToSeconds(duration_raw, diff.seconds)// (duration_raw * diff.seconds) / 100;
                
                    var movieDetail = {
                        starTime: startTimeDT + x * diff.seconds / 100,
                        endTime: startTimeDT + x * diff.seconds / 100 + duration_seconds,
                        duration: duration_seconds,
                        x: parseFloat(x)
                    };
                    movieDetails.push(movieDetail);
                }
                // Note, special care needs to be done with the first and last video, i.e. index = 0
                // In that case, we will need to load the video files to find the true duration
                scope.currentMovieIndex = findMovieIndex(movieDetails, newData.CursorPositions)
                
                scope.currentMovieDetail = movieDetails[scope.currentMovieIndex]
                scope.currentOffset = xToSeconds(newData.CursorPositions[0] - scope.currentMovieDetail.x, diff.seconds)
                if (newData.CursorPositions) {
                    scope.video.currentTime = scope.currentOffset
                    //scope.video.play()
                }
                // HAVE_NOTHING
                if (scope.video.readyState == 0 || scope.currentlyLoadedMovie != scope.currentMovie) {
                    
                    scope.video.load()
                    scope.currentlyLoadedMovie = scope.currentMovie
                }
                /*
                scope.lastVideo = newData.Traces[0].Value;
                if (newData.CursorPositions) {
                    scope.cursorVideo = newData.Traces[0].CursorValues[0]
                }
                else {
                    scope.cursorVideo = scope.lastVideo
                }*/
            };
        }
    }

    const definition = {
        // Specify the unique name for this symbol; this instructs PI Vision to also
        // look for HTML template and config template files called sym-<typeName>-template.html and sym-<typeName>-config.html
        typeName: 'video',
        displayName: 'Embed Video',
        datasourceBehavior: PV.Extensibility.Enums.DatasourceBehaviors.Single,

        // code by Vicons Design from the Noun Project
        iconUrl: '/Scripts/app/editor/symbols/ext/Icons/video.svg',

        visObjectType: movieVis,
        inject: ['log'],
        getDefaultConfig: () => ({
            // configuration used by PI Vision
            DataShape: 'Trend',
            Height: 300,
            Width: 600,
            FormatType: "F2",

        }),
        // This symbol has one configuration
        configOptions: () => ([{
            title: 'Format Symbol',
            mode: 'format'
        }])
    };

    // Register this custom symbol definition with PI Vision
    PV.symbolCatalog.register(definition);

})(window.PIVisualization);