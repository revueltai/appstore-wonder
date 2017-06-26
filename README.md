# Appstore-wonder
These Photoshop scripts will help you speed up the production/localization/export of screeshots for the AppStore or Google Play.
It combines Photoshop’s JSX scripts, some pretty simple PSD templates and some JSONs to handle the localizations.

## Installation steps

1.  Install the Scripts:  
    Copy the Files in the folder **Scripts/** into photoshop’s Scripts folder.  
    On mac you can find it in **/Applications/Adobe Photoshop CC 2017/Presets/Scripts/**

2.  Start or restart Photoshop to get the scripts listed. You will find them in **File > Scripts**

## The Project structure

It includes 2 folders:

*   **Scripts/** Where all the .jsx scripts and their dependencies are located
*   **Example_folder/** Where you will find all required files (PSDs, JSONs), that you will need to make the scripts work

```
Example_folder/	                # You can rename it as you want
| 
|-- _languages/                 # Contains all languages vars, placed in subfolders, 1 for each language
|   |-- [ language_folders ]/   # each folder is named after its language code (en, es, de, etc)
|   |   |-- images.json   	    # a JSON file containing the language vars
|   |   ...
|
|-- _templates/                 # Contains all PSD templates, one for each device size and orientation
|   |-- ipadPro_landscape.psd
|   |-- ipadPro_portrait.psd
|   |-- iphone6plus_landscape.psd
|   |-- iphone6plus_portrait.psd
|
|-- Exports/                    # Optional folder were to place all generated files (script generated)
```

## Preparing the files

Once you have installed the scripts you will need to:  

1.  Place your own localization vars into each JSON file inside the “_languages” folder.  

2.  Replace/Rename the text layers inside the template PSDs that you will need.

Step by step description:

**Place your own localization vars into each JSON file inside the “_languages” folder:** You will find a subfolder for each language ('en-EN/' for example). Inside them you will locate the JSON file named **images.json**. You can add or remove key/value pairs as your project demands it.  

Each JSON file looks like this:  

```
{
  "image1_1": "Customize",
  "image1_2": "all your",
  "image1_3": "images!",
  "image2_1": "Make your images easy to",
  "image2_2": "localize!",
  "image3_1": "Long texts will",
  "image3_2": "automatically fit the textfields!",
  "image4_1": "Code is 100%",
  "image4_2": "free to use!",
  "image5_1": "Did you find it useful?",
  "image5_2": "Share it!"
}
```
You can add new subfolders, but they should contain a `images.json` file like the one in the other subfolders.

**Replace/Rename the text layers inside the template PSDs that you will need:** Replace/Rename the text layers according to the language keys that you defined in the JSON files of point 1\. For example, if your JSON files have a key named “foo” the templates should also have a textfield named “foo”. You can add or remove texts layers as you require.

## Using the Scripts

If you followed all previous points correctly you can now run the scripts.
There are 3 different scripts:

1.  The **ImagesGenerator.jsx** will parse each images.json and populate the textfields inside the PSD template you selected.

2.  The **ImagesResizer.jsx** will resize one or many selected PSDs, created on step 1, to other device sizes.

1.  The **ImagesExporter.jsx** will export images from the PSDs created on step 1 or 2 (as JPGs or PNGs).

**1 - The ImagesGenerator:**  
When executing it will prompt a window asking to set: 
 - The template PSD to use
 - The folder with the translation JSON files
 - The folder where to save the images
 - The export settings for the images (scale down texts to fit textboxes, use fallback fonts for non-western languages)
 
**2 - The ImagesResizer: Deprecated**  
Script Deprecated: This script was intended originally to speed up the production of images for Apple's Appstore. Since a while the Appstore doesn’t require independent images for each one of the device sizes they have, but instead reuses the ones from the largest device (at the time I write this those are iphone6+ and ipadPro). Therefore, this script has lost its purpose. You might still find it practical for batch resizing other kind of files.

**3 - The ImagesExporter:**  
When executing it will prompt a window asking to set:
 - The folder with PSDs to process
 - The folder where to save the images
 - The export settings for the images (aspect ratio, device, format, etc)


JSON files are parsed in Photoshop using [jamJSON](http://www.tonton-pixel.com/blog/json-photoshop-scripting/json-action-manager/)
