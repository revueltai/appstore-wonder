/*
Author: Ignacio Revuelta
www.iamnacho.com

Description:
This script reads all PSD files inside a given folder, then saves each of the artboards as images (PNG, JPG)
*/

#target photoshop

//@includepath "helpers/"
//@include "Helpers.jsxinc"
//@include "Console.jsxinc"

var ImagesExporter = (function() {

  function ImagesExporter() {

    this.view = null
    this.inputFolder = null
    this.saveFolderPath = null
    this.outputOrientation = 'portrait'
    this.outputDevice = ''
    this.format = 'jpg'
    this.devicesNameList = new Array()
    this.devicesNameList[0] = ''
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
        this.devicesNameList.push(key)
      }
    }
    this.UIcreateWindow()
  }

  ImagesExporter.prototype = {

    UIcreateWindow: function() {
      var self = this
      this.view = new Window('dialog', 'Images Exporter')

      var view = this.view
      view.preferredSize = [200, 300]
      view.alignChildren = ['fill', 'top']

      var panelFolderInput = view.add('Panel', undefined, 'Documents to process')
      panelFolderInput.margins = 20
      panelFolderInput.orientation = 'row'
      var panelFolderInputField = panelFolderInput.add('edittext', undefined, '', {readonly: true})
      panelFolderInputField.characters = 25
      panelFolderInputField.enabled = false
      var panelFolderInputBtn = panelFolderInput.add('button', undefined, 'Choose folder')

      var panelFolderSave = view.add('Panel', undefined, 'Export location')
      panelFolderSave.margins = 20
      panelFolderSave.orientation = 'row'
      var panelFolderSaveField = panelFolderSave.add('edittext', undefined, '', {readonly: true})
      panelFolderSaveField.characters = 25
      panelFolderSaveField.enabled = false
      var panelFolderSaveBtn = panelFolderSave.add('button', undefined, 'Choose folder')

      var panelFormat = view.add('Panel', undefined, 'Export Format')
      panelFormat.orientation = 'row'
      panelFormat.margins = 20
      var radioJPG = panelFormat.add('radiobutton', undefined, 'jpg')
      var radioPNG = panelFormat.add('radiobutton', undefined, 'png')
      radioJPG.value = true;

      var panelOrientation = view.add('Panel', undefined, 'Device Format')
      panelOrientation.orientation = 'row'
      panelOrientation.margins = 20
      var radioPortrait = panelOrientation.add('radiobutton', undefined, 'portrait')
      var radioLandscape = panelOrientation.add('radiobutton', undefined, 'landscape')
      radioPortrait.value = true

      var panelDevice = view.add('Panel', undefined, 'Select a device (Optional)')
      panelDevice.orientation = 'row'
      var selector = panelDevice.add('dropdownlist', undefined, self.devicesNameList, {name: 'devicesList'})
      selector.selection = 0

      var footer = view.add('Group')
      footer.orientation = 'row'
      footer.alignChildren = ['fill', 'top']
      var btnClose = footer.add('button', undefined, 'Cancel')
      var btnContinue = footer.add('button', undefined, 'Run')

      panelFolderInputBtn.addEventListener('click', function() {
        self.inputFolder = Folder.selectDialog('Select a folder of documents to process')
        self.saveFolderPath = (String(self.inputFolder).match('/Source_files') != -1) ? String(self.inputFolder).split('/Source_files')[0] : self.inputFolder
        self.saveFolderPath = self.saveFolderPath + '/'

        panelFolderInputField.text = self.inputFolder
        panelFolderSaveField.text = self.saveFolderPath
        panelFolderInputField.enabled = true
        panelFolderSaveField.enabled = true
        panelFolderInputField.helpTip = self.inputFolder
        panelFolderSaveField.helpTip = self.saveFolderPath
      })

      panelFolderSaveBtn.addEventListener('click', function() {
        self.saveFolderPath = Folder.selectDialog('Select a save folder') + '/'
        panelFolderSaveField.text = self.saveFolderPath
        panelFolderSaveField.enabled = true
        panelFolderSaveField.helpTip = self.saveFolderPath
      })

      btnClose.addEventListener('click', function() {
        view.close()
      })

      btnContinue.addEventListener('click', function() {
        if (self.inputFolder !== null && self.saveFolderPath !== null) {
          self.format = radioPNG.value ? radioPNG.text : radioJPG.text
          self.outputOrientation = radioPortrait.value ? radioPortrait.text : radioLandscape.text
          self.outputDevice = selector.selection

          panelFolderInput.visible = false
          panelFolderSave.visible = false

          view.close()
          self.initialize()
        } else {
          alert('Please, fill all required fields')
        }
      })

      var rs = view.show()
    },

    initialize: function() {
      var workFiles = []
      var fileList = this.inputFolder.getFiles()
      for (var i = 0; i < fileList.length; ++i) {
        if (fileList[i] instanceof File && !fileList[i].hidden && Helpers.isValidFileExtension(fileList[i], Array('psd'))) {
          fileName = String(fileList[i]).split('/').pop()
          documentName = fileName.substring(0, fileName.indexOf('.'))
          workFiles.push({
            file: fileList[i],
            name: documentName
          })
        }
      }

      this.handleFiles(workFiles);
    },

    handleFiles: function(workFiles) {
      for (var i = 0; i < workFiles.length; ++i) {
        current = workFiles[i]
        if (this.outputDevice != '' && this.languagesMapping.hasOwnProperty(current.name)) {
          var folders = this.languagesMapping[current.name]
          for (var j = 0; j < folders.length; ++j) {
            this.handleActiveFile(current.file, folders[j])
          }
        } else {
          this.handleActiveFile(current.file, current.name)
        }

      }
    },

    handleActiveFile: function(file, saveFolder) {

      open(file)

      if (!documents.length) {
        return
      }

      var w = null
      var h = null
      var baseDocument = activeDocument

      if (this.outputDevice != '') {
        var outputSize = this.devices[this.outputDevice]
        if (this.outputOrientation === 'portrait') {
          w = outputSize[0]
          h = outputSize[1]
        } else if(this.outputOrientation === 'landscape') {
          w = outputSize[1]
          h = outputSize[0]
        }
      }

      var saveFolderPath = Helpers.createFolder(this.saveFolderPath + saveFolder + '/')
      var saveFileName = null

      for (var i = 0; i < baseDocument.layerSets.length; ++i) {
        var layerName = baseDocument.layerSets[i].name
        activeDocument.activeLayer = activeDocument.layers.getByName(layerName)
        Helpers.duplicateLayers()
        activeDocument.mergeVisibleLayers()
        activeDocument.trim(TrimType.TRANSPARENT, true, true, true, true)

        if (this.outputDevice != '') {
          saveFileName = layerName + '_' + String(this.outputDevice) + '_' + layerName + '.Screenshot-' + w + 'x' + h
          activeDocument.resizeCanvas(w, h)
        } else {
          saveFileName = layerName
        }

        Helpers.saveImage(saveFolderPath + saveFileName, this.format, 10)
        activeDocument.close(SaveOptions.DONOTSAVECHANGES);
      }

      activeDocument.close(SaveOptions.DONOTSAVECHANGES)
    }
  }

  return ImagesExporter

})()

////////////////////////////////////

new ImagesExporter()
