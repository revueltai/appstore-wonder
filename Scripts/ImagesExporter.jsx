/*
Author: Ignacio Revuelta
www.iamnacho.com

Description:
This script reads all PSD files inside a given folder, then saves the contents as images (PNG, JPG) or as MOV with transparency (Beta).
*/

#target photoshop

//@includepath "helpers/"
//@include "UIWindow.jsxinc"
//@include "UIProgressBar.jsxinc"
//@include "Helpers.jsxinc"

var ImagesExporter = (function() {

  function ImagesExporter() {
    var self = this;

    this.saveAsVideo = true;
    this.totalFiles = null;
    this.progressbar = null;
    this.inputFolder = null;
    this.saveFolderPath = null;
    this.timestamp = + new Date();
    this.outputOrientation = 'portrait';
    this.outputDevice = '';
    this.format = 'png';
    this.fileHasArtboards = true;
    this.formatList = ['png', 'jpg', 'mov'];
    this.devicesNameList = new Array();
    this.devicesNameList[0] = '';
    this.devices = {
      'ipadPro': [2048, 2732],
      'ipad': [1536, 2048],
      'iphone6plus': [1242, 2208],
      'iphone6': [750, 1334],
      'iphone5': [640, 1136],
      'iphone4': [640, 960]
    }

    this.languagesMapping = {
      en: ['en-US', 'en-GB'],
      fr: ['fr-FR', 'fr-CA'],
      es: ['es-ES', 'es-MX'],
      pt: ['pt-PT', 'pt-BR']
    }

    for (var key in this.devices) {
      if (this.devices.hasOwnProperty(key)) {
        this.devicesNameList.push(key);
      }
    }

    var view = new UIWindow({
      type: 'dialog',
      name: 'Images Exporter',
      bounds: undefined,
      properties: {
        preferredSize: [200, 300],
        alignChildren: ['fill', 'top'],
        closeButton: true
      }
    });
    view.appendElements({
      'panelFolderInput': {
        type: 'panel',
        parent: undefined,
        bounds: undefined,
        title: 'Documents to process',
        properties: {
          margins: 20,
          orientation: 'row'
        }
      },
      'panelFolderInputField': {
        type: 'edittext',
        parent: 'panelFolderInput',
        bounds: undefined,
        title: '',
        properties: {
          readonly: true,
          enabled: false,
          characters: 25
        }
      },
      'panelFolderInputBtn': {
        type: 'button',
        parent: 'panelFolderInput',
        bounds: undefined,
        title: 'Choose a file'
      },
      'panelFolderSave': {
        type: 'panel',
        parent: undefined,
        bounds: undefined,
        title: 'Export location',
        properties: {
          margins: 20,
          orientation: 'row'
        }
      },
      'panelFolderSaveField': {
        type: 'edittext',
        parent: 'panelFolderSave',
        bounds: undefined,
        title: '',
        properties: {
          readonly: true,
          enabled: false,
          characters: 25
        }
      },
      'panelFolderSaveBtn': {
        type: 'button',
        parent: 'panelFolderSave',
        bounds: undefined,
        title: 'Choose folder',
        properties: {
          enabled: false
        }
      },
      'panelFormat': {
        type: 'panel',
        parent: undefined,
        bounds: undefined,
        title: 'Export format',
        properties: {
          margins: 20,
          orientation: 'row'
        }
      },
      'selectorFormat': {
        type: 'dropdownlist',
        parent: 'panelFormat',
        bounds: undefined,
        title: self.formatList,
        properties: {
          selection: 0,
          enabled: false,
          name: 'formatList'
        }
      },
      'panelFileSettings': {
        type: 'panel',
        parent: undefined,
        bounds: undefined,
        title: 'File Settings',
        properties: {
          margins: 20,
          orientation: 'row'
        }
      },
      'checkboxHasArtboards': {
        type: 'checkbox',
        parent: 'panelFileSettings',
        bounds: undefined,
        title: 'PSD has Artboards',
        properties: {
          enabled: false,
          value: true
        }
      },
      'panelOrientation': {
        type: 'panel',
        parent: undefined,
        bounds: undefined,
        title: 'Device Orientation',
        properties: {
          margins: 20,
          orientation: 'row'
        }
      },
      'radioPortrait': {
        type: 'radiobutton',
        parent: 'panelOrientation',
        bounds: undefined,
        title: 'Portrait',
        properties: {
          enabled: false,
          value: true
        }
      },
      'radioLandscape': {
        type: 'radiobutton',
        parent: 'panelOrientation',
        bounds: undefined,
        title: 'Landscape',
        properties: {
          enabled: false,
          value: false
        }
      },
      'panelDevice': {
        type: 'panel',
        parent: undefined,
        bounds: undefined,
        title: 'Select a device (Optional)',
        properties: {
          margins: 20,
          orientation: 'row'
        }
      },
      'selectorDevice': {
        type: 'dropdownlist',
        parent: 'panelDevice',
        bounds: undefined,
        title: self.devicesNameList,
        properties: {
          selection: 0,
          enabled: false,
          name: 'devicesList'
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

    view.find('panelFolderInputBtn').addEventListener('click', function() {
      self.inputFolder = Folder.selectDialog('Select a folder of documents to process');
      if (String(self.inputFolder).indexOf('/Source_files') != -1) {
        self.saveFolderPath = String(self.inputFolder).split('/Source_files')[0] + '/Images-' + self.timestamp + '/';
      } else {
        self.saveFolderPath = self.inputFolder + '/';
      }

      view.find('panelFolderInputField').text = self.inputFolder;
      view.find('panelFolderSaveField').text = self.saveFolderPath;
      view.find('panelFolderInputField').enabled = true;
      view.find('panelFolderSaveField').enabled = true;
      view.find('panelFolderSaveBtn').enabled = true;
      view.find('radioPortrait').enabled = true;
      view.find('radioLandscape').enabled = true;
      view.find('checkboxHasArtboards').enabled = true;
      view.find('selectorFormat').enabled = true;
      view.find('selectorDevice').enabled = true;
      view.find('btnRun').enabled = true;

      view.find('panelFolderInputField').helpTip = self.inputFolder;
      view.find('panelFolderSaveField').helpTip = self.saveFolderPath;
    });
    view.find('selectorFormat').addEventListener('change', function() {
      self.format = String(view.find('selectorFormat').selection);
      if (self.format == 'mov') {
        view.find('panelOrientation').enabled = false;
        view.find('panelDevice').enabled = false;
        view.find('panelFileSettings').enabled = false;
      } else {
        view.find('panelOrientation').enabled = true;
        view.find('panelDevice').enabled = true;
        view.find('panelFileSettings').enabled = true;
      }
    });
    view.find('panelFolderSaveBtn').addEventListener('click', function() {
      self.saveFolderPath = Folder.selectDialog('Select a save folder') + '/';
      view.find('panelFolderSaveField').text = self.saveFolderPath;
      view.find('panelFolderSaveField').enabled = true;
      view.find('panelFolderSaveField').helpTip = self.saveFolderPath;
    });
    view.find('btnClose').addEventListener('click', function() {
      view.close();
    });
    view.find('btnRun').addEventListener('click', function() {
      if (self.inputFolder !== null && self.saveFolderPath !== null) {
        self.format = String(view.find('selectorFormat').selection);
        self.outputOrientation = (view.find('radioPortrait').value) ? view.find('radioPortrait').text : view.find('radioLandscape').text;
        self.outputDevice = view.find('selectorDevice').selection;

        view.find('panelFolderInput').visible = false;
        view.find('panelFolderSave').visible = false;

        self.fileHasArtboards = view.find('checkboxHasArtboards').value;

        view.close();
        self.initialize();
      } else {
        alert('Please, fill in all required fields');
      }
    });
    view.open();
  }

  ImagesExporter.prototype = {

    initialize: function() {
      var workFiles = [];
      var fileList = this.inputFolder.getFiles();
      this.progressbar = new UIProgressBar({
        title: 'Exporting Images',
        message: 'This might take a while...'
      });
      for (var i = 0; i < fileList.length; ++i) {
        if (fileList[i] instanceof File && !fileList[i].hidden && Helpers.isValidFileExtension(fileList[i], Array('psd'))) {
          fileName = String(fileList[i]).split('/').pop();
          workFiles.push({
            file: fileList[i],
            name: fileName.substring(0, fileName.indexOf('.'))
          });
        }
      }
      this.handleFiles(workFiles);
    },

    handleFiles: function(workFiles) {
      for (var i = 0; i < workFiles.length; ++i) {
        currentFile = workFiles[i];
        if (this.outputDevice != '' && this.languagesMapping.hasOwnProperty(currentFile.name)) {
          var folders = this.languagesMapping[currentFile.name];
          for (var j = 0; j < folders.length; ++j) {
            this.handleActiveFile(currentFile.file, folders[j]);
          }
        } else {
          this.handleActiveFile(currentFile.file, currentFile.name);
        }
      }
    },

    handleActiveFile: function(file, saveFolder) {
      var w = null;
      var h = null;
      var saveFolderPath = null;

      open(file);

      if (!documents.length) {
        return;
      }

      this.progressbar.updateText('Exporting...');

      if (this.format === 'mov') {
        saveFolderPath = Helpers.createFolder(this.saveFolderPath);
        Helpers.saveAsMov(saveFolderPath);
      } else {

        if (this.outputDevice != '') {
          var outputSize = this.devices[this.outputDevice];
          if (this.outputOrientation === 'portrait') {
            w = outputSize[0];
            h = outputSize[1];
          } else if(this.outputOrientation === 'landscape') {
            w = outputSize[1];
            h = outputSize[0];
          }
        }

        if (!this.fileHasArtboards) {
          activeDocument.mergeVisibleLayers();
          activeDocument.trim(TrimType.TRANSPARENT, true, true, true, true);
          saveFolderPath = Helpers.createFolder(this.saveFolderPath);
          this.exportImage(saveFolderPath, saveFolder, w, h);
        } else {
          var layerName = null;
          saveFolderPath = Helpers.createFolder(this.saveFolderPath + saveFolder + '/');
          for (var i = 0; i < activeDocument.layerSets.length; ++i) {
            layerName = activeDocument.layerSets[i].name;
            activeDocument.activeLayer = activeDocument.layers.getByName(layerName);
            Helpers.duplicateLayers();
            activeDocument.mergeVisibleLayers();
            activeDocument.trim(TrimType.TRANSPARENT, true, true, true, true);
            this.exportImage(saveFolderPath, layerName, w, h);
          }
          activeDocument.close(SaveOptions.DONOTSAVECHANGES);
        }
      }
    },

    exportImage: function(saveFolderPath, name, w, h) {
      var saveFileName = null;
      if (this.outputDevice != '') {
        saveFileName = name + '_' + String(this.outputDevice) + '_' + name + '.Screenshot-' + w + 'x' + h;
        activeDocument.resizeCanvas(w, h);
      } else {
        saveFileName = name;
      }
      Helpers.saveImageForWeb(saveFolderPath + saveFileName, this.format, 10);
      activeDocument.close(SaveOptions.DONOTSAVECHANGES);
    }
  }

  return ImagesExporter;

})()

////////////////////////////////////

try {
  new ImagesExporter();
} catch (error) {
<<<<<<< HEAD
  alert(error);
}
=======
  Console.log(error);
}

>>>>>>> origin/master
