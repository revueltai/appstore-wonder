/*
Author: Ignacio Revuelta
www.iamnacho.com

Description:
This script reads a "template PSD" and a "languages" JSON file.
Then generates all the "language PSDs", one for each language in the JSON, placing the corresponding texts.
*/

#target photoshop

//@includepath "helpers/jamjson/"
//@include "jamEngine.jsxinc"
//@include "jamJSON.jsxinc"

//@includepath "helpers/"
//@include "Console.jsxinc"
//@include "Helpers.jsxinc"
//@include "Textfill.jsxinc"

var ImagesGenerator = (function() {

  function ImagesGenerator() {

    this.languagesListAlert = '';
    this.languageNames = new Array();
    this.languageNames['ar'] = 'Arabic';
    this.languageNames['ko'] = 'Korean';
    this.languageNames['ja'] = 'Japanese';
    this.languageNames['th'] = 'Thai';
    this.languageNames['ru'] = 'Russian';
    this.languageNames['pl'] = 'Polish';
    this.languageNames['vi'] = 'Vietnamese';
    this.languageNames['zh-cn'] = 'Chinese CN';
    this.languageNames['zh-tw'] = 'Chinese TW';

    this.fontsFallback = new Array();
    this.fontsFallback['ar'] = 'Adobe Arabic Bold';
    this.fontsFallback['ko'] = 'Noto Sans CJK JP Bold';
    this.fontsFallback['ja'] = 'Meiryo Bold';
    this.fontsFallback['th'] = 'Arial Unicode MS';
    this.fontsFallback['ru'] = 'Proxima Nova Bold';
    this.fontsFallback['pl'] = 'Proxima Nova Bold';
    this.fontsFallback['vi'] = 'Baloo Bhaina';
    this.fontsFallback['zh-cn'] = 'Heiti TC Medium';
    this.fontsFallback['zh-tw'] = 'Heiti TC Medium';

    this.view = null;
    this.inputFile = null;
    this.templateFileName = null;
    this.languageFolderName = null;
    this.saveFolderName = null;
    this.timestamp = + new Date();

    this.languageVars = new Array();
    this.settings = {
      fitText: true,
      useFallbackFonts: true
    }
    this.UIcreateWindow();
  }

  ImagesGenerator.prototype = {

    UIcreateWindow: function() {
      var self = this;
      this.view = new Window('dialog', 'Images Generator');

      this.view.alignChildren = ['fill', 'top'];

      var panelTemplate = this.view.add('Panel', undefined, 'Template PSD location');
      panelTemplate.margins = 20;
      panelTemplate.orientation = 'row';
      var panelTemplateField = panelTemplate.add('edittext', undefined, '', {readonly: true});
      panelTemplateField.characters = 20;
      panelTemplateField.enabled = false;
      var panelTemplateBtn = panelTemplate.add('button', undefined, 'Choose file');

      var panelLanguages = this.view.add('Panel', undefined, 'Languages location');
      panelLanguages.margins = 20;
      panelLanguages.orientation = 'row';
      var panelLanguagesField = panelLanguages.add('edittext', undefined, '', {readonly: true});
      panelLanguagesField.characters = 20;
      panelLanguagesField.enabled = false;
      var panelLanguagesBtn = panelLanguages.add('button', undefined, 'Choose folder');

      var panelSave = this.view.add('Panel', undefined, 'Save folder location');
      panelSave.margins = 20;
      panelSave.orientation = 'row';
      var panelSaveField = panelSave.add('edittext', undefined, '', {readonly: true});
      panelSaveField.characters = 20;
      panelSaveField.enabled = false;
      var panelSaveBtn = panelSave.add('button', undefined, 'Choose folder');

      var checkboxfitTexts = this.view.add('Checkbox', undefined, 'Scale all texts to containers (slows down performance)');
      checkboxfitTexts.value = true;

      var checkboxDefaultFonts = this.view.add('Checkbox', undefined, 'Use fallback fonts for non-western languages');
      checkboxDefaultFonts.value = true;

      var fontsFallbackBtn = this.view.add('button', undefined, 'Show fallback languages list');

      var footer = this.view.add('Group');
      footer.orientation = 'row';
      footer.alignChildren = ['fill', 'top'];
      var btnClose = footer.add('button', undefined, 'Cancel');
      var btnRun = footer.add('button', undefined, 'Run');


      checkboxDefaultFonts.addEventListener('click', function() {
        (this.value) ? fontsFallbackBtn.show() : fontsFallbackBtn.hide();
      })

      fontsFallbackBtn.addEventListener('click', function() {
        if (self.languagesListAlert == '') {
          for (var key in self.fontsFallback) {
            if (self.fontsFallback.hasOwnProperty(key) && self.languageNames.hasOwnProperty(key)) {
              self.languagesListAlert += self.languageNames[key] + ' (' + key + '): ' + self.fontsFallback[key] + '\n';
            }
          }
        }

        alert('Fallback fonts list:\n' + self.languagesListAlert + '\nYou might need to install some fonts if you are missing them. Or You can replace the fontname for the one you want in the script code: Adobe Photoshop CC 2017/Presets/Scripts/ImagesGenerator.jsx');
      })

      panelTemplateBtn.addEventListener('click', function() {
        self.inputFile = File.openDialog('Select your template PSD file');
        self.templateFileName = self.inputFile.name.replace(/.psd/, '');
        self.languageFolderName = self.inputFile.path.replace(/_templates/, '_languages/');
        self.saveFolderName = self.inputFile.path.replace(/_templates/, 'Exports/Source_files-' + self.timestamp + '/');
        panelTemplateField.text = self.inputFile;
        panelLanguagesField.text = self.languageFolderName;
        panelSaveField.text = self.saveFolderName;

        panelTemplateField.enabled = true;
        panelLanguagesField.enabled = true;
        panelSaveField.enabled = true;
        panelTemplateField.helpTip = self.inputFile;
        panelLanguagesField.helpTip = self.languageFolderName;
        panelSaveField.helpTip = self.saveFolderName;
      })

      panelLanguagesBtn.addEventListener('click', function() {
        self.languageFolderName = Folder.selectDialog('Select the languages folder to use') + '/';
        panelLanguagesField.text = self.languageFolderName;
        panelLanguagesField.helpTip = panelLanguagesField.text;
        panelLanguagesField.enabled = true;
      })

      panelSaveBtn.addEventListener('click', function() {
        self.saveFolderName = Folder.selectDialog('Select the languages folder to use') + '/';
        panelSaveField.text = self.saveFolderName;
        panelSaveField.helpTip = panelSaveField.text;
        panelSaveField.enabled = true;
      })

      btnClose.addEventListener('click', function() {
        self.view.close();
      })

      btnRun.addEventListener('click', function() {
        if (self.inputFile !== null && self.languageFolderName !== null && self.saveFolderName !== null) {
          self.settings.useFallbackFonts = checkboxDefaultFonts.value;
          self.settings.fitText = checkboxfitTexts.value;

          panelTemplate.hide();
          panelLanguages.hide();
          panelSave.hide();
          checkboxDefaultFonts.hide();
          checkboxfitTexts.hide();
          fontsFallbackBtn.hide();
          this.enabled = false;

          self.getJSONS();

        } else {
          alert('Please, fill all required fields');
        }
      })

      this.view.show();
    },

    UIupdateStatus: function(message) {
      Console.log('STATUS', message);
    },

    UIdeleteWindow: function() {
      this.UIupdateStatus('end');
      this.view.close();
    },

    getJSONS: function() {
      var currentLanguage = null;
      var languageName = null;
      var jsonData = null;
      var subFoldersList = null;
      var folderMain = Folder(this.languageFolderName);

      if (folderMain.exists) {

        app.bringToFront();
        app.open(this.inputFile);
        app.preferences.rulerUnits = Units.PIXELS;
        app.preferences.typeUnits = TypeUnits.PIXELS;

        subFoldersList = folderMain.getFiles();
        for (var i = 0; i < subFoldersList.length; ++i) {
          languageName = subFoldersList[i].name.toLowerCase();

          if (subFoldersList[i] instanceof Folder) {
            var jsonFileName = new Folder(this.languageFolderName + languageName).getFiles(/\.(json)$/i)[0].name;
            jsonData = this.readJSON(this.languageFolderName + languageName + '/' + jsonFileName);
            if (jsonData) {
              this.languageVars[languageName] = jsonData;
              Helpers.createFolder(this.saveFolderName + this.templateFileName + '/');
              Helpers.savePSD(this.saveFolderName + this.templateFileName + '/' + languageName);
              this.UIupdateStatus('File created: ' + languageName);
            } else {
              alert('Error. JSON data is empty for:' + jsonFileName);
            }
          }
        }

        activeDocument.close(SaveOptions.DONOTSAVECHANGES);

        var files = new Folder(this.saveFolderName + this.templateFileName).getFiles(/\.(psd)$/i);
        for (var i = 0 ; i < files.length ; ++i) {
          app.bringToFront();
          app.open(files[i]);
          currentLanguage = activeDocument.name.replace(/.psd/, '');
          this.replaceTexts(currentLanguage);
          Helpers.savePSD(files[i]);
          activeDocument.close(SaveOptions.DONOTSAVECHANGES);
        }
      }

      this.UIdeleteWindow();
    },

    readJSON: function(jsonFilePath) {
      var json = File(jsonFilePath)
      if (json.exists) {
        json.open('r')
        var data = json.read()
        json.close()
        return jamJSON.parse(data, true)
      } else {
        alert('Error. Folder name is wrong for: ' + jsonFilePath + '\nPlease check that all language folders are lowercase and in 2 characters long groups (e.g: "en/", "zh-cn/")');
      }
    },

    replaceTexts: function(currentLanguage) {
      var texts = this.languageVars[currentLanguage]
      this.UIupdateStatus('Replacing texts for: ' + currentLanguage)
      for (var layerName in texts) {
        if (texts.hasOwnProperty(layerName)) {
          this.changeTextLayerByLayerName(layerName, texts[layerName], currentLanguage)
        }
      }
    },

    changeTextLayerByLayerName: function(layerName, newText, currentLanguage) {

      if (Helpers.makeActiveLayerByName(layerName) != undefined) {
        var layer = activeDocument.activeLayer
        if (layer.name === layerName && layer.kind === LayerKind.TEXT) {
          layer.textItem.contents = newText
          if (this.settings.useFallbackFonts && (currentLanguage in this.fontsFallback)) {
            layer.textItem.font = Helpers.getInternalFontName(this.fontsFallback[currentLanguage], layer.textItem.font)
          }

          layer.name = layerName
          Helpers.setParagraphDirection((currentLanguage == 'ar') ? 'dirRightToLeft' : 'dirLeftToRight')

          if (this.settings.fitText) {
            this.UIupdateStatus('Scaling texts for: ' + layer.name);
            new Textfill(layer);
          }
        }
      }
    }
  }

  return ImagesGenerator;

})();

////////////////////////////////////

new ImagesGenerator();
