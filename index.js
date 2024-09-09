const fs = require('fs');
const Shazam = require('node-shazam').Shazam;
const write = require('ffmetadata').write;
const path = require('path');
const shazam = new Shazam()
const FOLDER_PATH = "C:\\Music"

let files = fs.readdirSync(FOLDER_PATH, { withFileTypes: true }).filter(dirent => dirent.isFile() && dirent.name.endsWith(`.mp3`));

for (const file of files) {
//    const file = files[0];
    console.log(`Processing ${file.name}...`);
    const recognise = shazam.recognise(path.join(FOLDER_PATH, file.name),'en-US').then((result) => {
        if (!result.track) {
            console.error(`No result for ${file.name}`);
            return;
        }

        if (!result.track.subtitle || !result.track.title) {
            console.error(`No title or artist for ${file.name}`);
            return;
        }

        let rawTitle = result.track.title;
        let rawSubtitle = result.track.subtitle;

        result.track.title = result.track.title.replace(/[\\/:*?"<>|]/g, '');
        result.track.subtitle = result.track.subtitle.replace(/[\\/:*?"<>|]/g, '');

        if (result.track.subtitle.length > 60) {
            result.track.subtitle = result.track.subtitle.substring(0, 60);
        }

        if (result.track.title.length > 60) {
            result.track.title = result.track.title.substring(0, 60);
        }

        console.log(`Result for ${file.name}: ${result.track.subtitle} - ${result.track.title}`);
        const newName = `${result.track.subtitle} - ${result.track.title}.${result.track.key}.mp3`;
        fs.rename(path.join(FOLDER_PATH, file.name), path.join(FOLDER_PATH, newName), () => {;
            write(path.join(FOLDER_PATH, newName), {
                title: rawTitle,
                artist: rawSubtitle,
            }, function(err) {
                if (err) console.error("Error writing metadata", err);
                else console.log("Data written for " + newName);
            });
        });
        console.log(`Renamed ${file.name} to ${newName}`);
    }).catch((error) => {
        console.error(error)
    });
};

/*
var ffmetadata = require("ffmetadata");

// Set path to ffmpeg - optional if in $PATH or $FFMPEG_PATH
ffmetadata.setFfmpegPath("/path/to/ffmpeg");

// Read song.mp3 metadata
ffmetadata.read("song.mp3", function(err, data) {
	if (err) console.error("Error reading metadata", err);
	else console.log(data);
});

// Set the artist for song.mp3
var data = {
  artist: "Me",
};
ffmetadata.write("song.mp3", data, function(err) {
	if (err) console.error("Error writing metadata", err);
	else console.log("Data written");
});

Metadata

Metadata might include the following fields:

    "artist": artist name
    "album": album name
    "title": song title
    "track": place in the album (e.g. "5/8")
    "disc": for multidisc albums
    "label": record label
    "date": arbitrary, but usually year (e.g. "2002")
https://wiki.multimedia.cx/index.php?title=FFmpeg_Metadata#MP3
*/