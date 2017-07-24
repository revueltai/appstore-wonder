/*
Author: Ignacio Revuelta
www.iamnacho.com

Description:
Gets a PSD file, a JSON file and parses the texts in the texfields the PSD has. It can also scale down the texts to fit the containers (optional) and replace the font family for certain languages (optional). It generates new PSD files, one for each JSON that was given.
*/

#target photoshop

//@includepath "helpers/jamjson/"
//@include "jamEngine.jsxinc"
//@include "jamJSON.jsxinc"

//@includepath "helpers/"
//@include "UIProgressBar.jsxinc"
//@include "UIWindow.jsxinc"
//@include "Helpers.jsxinc"
//@include "Textfill.jsxinc"

var ImagesGenerator = (function() {

  function ImagesGenerator() {
    var self = this;

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

    this.inputFile = null;
    this.templateFileName = null;
    this.languageFolderName = null;
    this.saveFolderName = null;
    this.progressbar = null;
    this.timestamp = + new Date();
    this.languageVars = new Array();
    this.settings = {
      fitText: true,
      useFallbackFonts: true
    }

    var view = new UIWindow({
      type: 'dialog',
      name: 'Images Generator',
      bounds: undefined,
      properties: {
        alignChildren: ['fill', 'top'],
        closeButton: true
      }
    });
    view.appendElements({
      'panelTemplate': {
        type: 'panel',
        parent: undefined,
        bounds: undefined,
        title: 'Template PSD location',
        properties: {
          margins: 20,
          orientation: 'row',
          enabled: true
        }
      },
      'panelTemplateField': {
        type: 'edittext',
        parent: 'panelTemplate',
        bounds: undefined,
        title: '',
        properties: {
          readonly: true,
          enabled: false,
          characters: 20
        }
      },
      'panelTemplateBtn': {
        type: 'button',
        parent: 'panelTemplate',
        bounds: undefined,
        title: 'Choose a file'
      },
      'panelLanguages': {
        type: 'panel',
        parent: undefined,
        bounds: undefined,
        title: 'Languages Location',
        properties: {
          margins: 20,
          orientation: 'row',
          enabled: true
        }
      },
      'panelLanguagesField': {
        type: 'edittext',
        parent: 'panelLanguages',
        bounds: undefined,
        title: '',
        properties: {
          enabled: false,
          readonly: true,
          characters: 20
        }
      },
      'panelLanguagesBtn': {
        type: 'button',
        parent: 'panelLanguages',
        bounds: undefined,
        title: 'Choose folder',
        properties: {
          enabled: false
        }
      },
      'panelSave': {
        type: 'panel',
        parent: undefined,
        bounds: undefined,
        title: 'Save folder location',
        properties: {
          margins: 20,
          orientation: 'row',
          enabled: true
        }
      },
      'panelSaveField': {
        type: 'edittext',
        parent: 'panelSave',
        bounds: undefined,
        title: '',
        properties: {
          enabled: false,
          readonly: true,
          characters: 20
        }
      },
      'panelSaveBtn': {
        type: 'button',
        parent: 'panelSave',
        bounds: undefined,
        title: 'Choose folder',
        properties: {
          enabled: false
        }
      },
      'checkboxfitTexts': {
        type: 'checkbox',
        parent: undefined,
        bounds: undefined,
        title: 'Scale all texts to containers (slows down performance)',
        properties: {
          value: true,
          enabled: false
        }
      },
      'checkboxDefaultFonts': {
        type: 'checkbox',
        parent: undefined,
        bounds: undefined,
        title: 'Use fallback fonts for non-western languages',
        properties: {
          value: true,
          enabled: false
        }
      },
      'fontsFallbackBtn': {
        type: 'button',
        parent: undefined,
        bounds: undefined,
        title: 'Show fallback languages list',
        properties: {
          enabled: false
        }
      },
      'footerGroup': {
        type: 'group',
        parent: undefined,
        bounds: undefined,
        title: '',
        properties: {
          orientation: 'row',
          alignChildren: ['fill', 'top']
        }
      },
      'btnClose': {
        type: 'button',
        parent: 'footerGroup',
        bounds: undefined,
        title: 'Cancel'
      },
      'btnRun': {
        type: 'button',
        parent: 'footerGroup',
        bounds: undefined,
        title: 'Run',
        properties: {
          enabled: false
        }
      }
    });
    view.find('panelTemplateBtn').addEventListener('click', function() {
      self.inputFile = File.openDialog('Select your template PSD file');
      self.templateFileName = self.inputFile.name.replace(/.psd/, '');
      self.languageFolderName = self.inputFile.path.replace(/_templates/, '_languages/');
      self.saveFolderName = self.inputFile.path.replace(/_templates/, 'Exports/Source_files-' + self.timestamp + '/');

      view.find('panelTemplateField').text = self.inputFile;
      view.find('panelLanguagesField').text = self.languageFolderName;
      view.find('panelSaveField').text = self.saveFolderName;

      view.find('panelTemplateField').enabled = true;
      view.find('panelLanguagesField').enabled = true;
      view.find('panelSaveField').enabled = true;
      view.find('checkboxfitTexts').enabled = true;
      view.find('checkboxDefaultFonts').enabled = true;
      view.find('fontsFallbackBtn').enabled = true;
      view.find('panelSaveBtn').enabled = true;
      view.find('panelLanguagesBtn').enabled = true;
      view.find('btnRun').enabled = true;

      view.find('panelTemplateField').helpTip = self.inputFile;
      view.find('panelLanguagesField').helpTip = self.languageFolderName;
      view.find('panelSaveField').helpTip = self.saveFolderName;
    });
    view.find('panelLanguagesBtn').addEventListener('click', function() {
      self.languageFolderName = Folder.selectDialog('Select the languages folder to use') + '/';
      view.find('panelLanguagesField').text = self.languageFolderName;
      view.find('panelLanguagesField').helpTip = view.find('panelLanguagesField').text;
      view.find('panelLanguagesField').enabled = true;
    });
    view.find('panelSaveBtn').addEventListener('click', function() {
      self.saveFolderName = Folder.selectDialog('Select the languages folder to use') + '/';
      view.find('panelSaveField').text = self.saveFolderName;
      view.find('panelSaveField').helpTip = view.find('panelSaveField').text;
      view.find('panelSaveField').enabled = true;
    });
    view.find('checkboxDefaultFonts').addEventListener('click', function() {
      (this.value) ? view.find('fontsFallbackBtn').show() : view.find('fontsFallbackBtn').hide();
    });
    view.find('fontsFallbackBtn').addEventListener('click', function() {
      if (self.languagesListAlert == '') {
        for (var key in self.fontsFallback) {
          if (self.fontsFallback.hasOwnProperty(key) && self.languageNames.hasOwnProperty(key)) {
            self.languagesListAlert += self.languageNames[key] + ' (' + key + '): ' + self.fontsFallback[key] + '\n';
          }
        }
      }
      alert('Fallback fonts list:\n' + self.languagesListAlert + '\nYou might need to install some fonts if you are missing them. Or You can replace the fontname for the one you want in the script code: Adobe Photoshop CC 2017/Presets/Scripts/ImagesGenerator.jsx');
    });
    view.find('btnClose').addEventListener('click', function() {
      view.close();
    });
    view.find('btnRun').addEventListener('click', function() {
      if (self.inputFile !== null && self.languageFolderName !== null && self.saveFolderName !== null) {
        self.settings.useFallbackFonts = view.find('checkboxDefaultFonts').value;
        self.settings.fitText = view.find('checkboxfitTexts').value;
        this.enabled = false;

        view.find('panelTemplate').hide();
        view.find('panelLanguages').hide();
        view.find('panelSave').hide();
        view.find('checkboxDefaultFonts').hide();
        view.find('checkboxfitTexts').hide();
        view.find('fontsFallbackBtn').hide();

        view.close();
        self.getJSONS();
      } else {
        alert('Please, fill in all required fields');
      }
    });
    view.open();
  }

  ImagesGenerator.prototype = {

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

        this.progressbar = new UIProgressBar({
          title: 'Creating PSD files',
          message: 'This might take a while, go get a coffee!'
        });

        for (var i = 0; i < subFoldersList.length; ++i) {
          languageName = subFoldersList[i].name.toLowerCase();
          if (subFoldersList[i] instanceof Folder) {
            var jsonFileName = new Folder(this.languageFolderName + languageName).getFiles(/\.(json)$/i)[0].name;
            jsonData = this.readJSON(this.languageFolderName + languageName + '/' + jsonFileName);
            if (jsonData) {
              this.progressbar.updateText('Creating file for: ' + languageName);
              this.languageVars[languageName] = jsonData;
              Helpers.createFolder(this.saveFolderName + this.templateFileName + '/');
              Helpers.savePSD(this.saveFolderName + this.templateFileName + '/' + languageName);
            } else {
              alert('Error. JSON data is empty for:' + jsonFileName);
              this.progressbar.close();
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
    },

    readJSON: function(jsonFilePath) {
      var json = File(jsonFilePath)
      if (json.exists) {
        json.open('r');
        var data = json.read();
        json.close();
        return jamJSON.parse(data, true);
      } else {
        alert('Error. Folder name is wrong for: ' + jsonFilePath + '\nPlease check that all language folders are lowercase and in 2 characters long groups (e.g: "en/", "zh-cn/")');
      }
    },

    replaceTexts: function(currentLanguage) {
      var texts = this.languageVars[currentLanguage]
      this.progressbar.updateText('Replacing texts for: ' + currentLanguage);
      for (var layerName in texts) {
        if (texts.hasOwnProperty(layerName)) {
          this.changeTextLayerByLayerName(layerName, texts[layerName], currentLanguage)
        }
      }
    },

    changeTextLayerByLayerName: function(layerName, newText, currentLanguage) {
      if (Helpers.makeActiveLayerByName(layerName) != undefined) {
        var layer = activeDocument.activeLayer;
        if (layer.name === layerName && layer.kind === LayerKind.TEXT) {
          layer.textItem.contents = newText
          if (this.settings.useFallbackFonts && (currentLanguage in this.fontsFallback)) {
            layer.textItem.font = Helpers.getInternalFontName(this.fontsFallback[currentLanguage], layer.textItem.font)
          }
          layer.name = layerName
          Helpers.setParagraphDirection((currentLanguage == 'ar') ? 'dirRightToLeft' : 'dirLeftToRight')
          if (this.settings.fitText) {
            this.progressbar.updateText('Scaling texts for: ' + layer.name);
            new Textfill(layer);
          }
        }
      }
    }
  }

  return ImagesGenerator;

})();

////////////////////////////////////

try {
  new ImagesGenerator();
} catch (error) {
  alert(error);
}
