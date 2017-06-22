/*
Author: Ignacio Revuelta
www.iamnacho.com

Description:
This script resizes a PSD to a device size defined by the user.

Important:
- If the elements in the Artobards overflow the Artobards boundaries then the generated PSD might look wrong.

Requierments:
- A PSD in the correct layer format
*/

#target photoshop

//@includepath "helpers/"
//@include "Helpers.jsxinc"

var ImagesResizer = (function() {

  function ImagesResizer() {

    this.devices = {
      'ipadPro': [2048, 2732],
      'ipad': [1536, 2048],
      'iphone6+': [1242, 2208],
      'iphone6': [750, 1334],
      'iphone5': [640, 1136],
      'iphone4': [640, 960]
    }

    this.mainFile = '';
    this.outputDevice = 'iphone6';
    this.keepAspect = false;
    this.outputOrientation = 'portrait';
    this.inputFolder = Folder.selectDialog('Select a folder to process');
    this.saveFolder = Folder.selectDialog('Select a SAVE folder');
    this.saveFolder = this.saveFolder + '/';

    if (this.inputFolder !== null && this.saveFolder !== null) {
      this.createUIWindow()
    } else {
      alert('Error opening folders');
    }
  }

  ImagesResizer.prototype = {

    createUIWindow: function() {
      var self = this;
      var view = new Window('dialog', 'Appstore Images Resizer');
      view.preferredSize = [200, 100];

      var wrapper = view.add('group');
      wrapper.orientation = 'row';
      wrapper.alignChildren = ['fill', 'fill'];

      var devicePanel = wrapper.add('Panel')
      devicePanel.margins = 20;
      devicePanel.text = 'New Device size';
      devicePanel.orientation = 'row';
      var selector = devicePanel.add('dropdownlist', undefined, ['iphone6+', 'iphone6', 'iphone5', 'iphone4', 'ipadPro', 'ipad'], {name: 'devicesList'});
      selector.selection = 0;

      var aspectPanel = wrapper.add('Panel')
      aspectPanel.margins = 20
      aspectPanel.text = 'Keep Aspect Ratio?'
      aspectPanel.orientation = 'row'
      var selectorAspect = aspectPanel.add('dropdownlist', undefined, ['Yes', 'No'], {name: 'aspectList'})
      selectorAspect.selection = 1

      var formatPanel = wrapper.add('Panel')
      formatPanel.margins = 20
      formatPanel.text = 'Export Format'
      formatPanel.orientation = 'row'
      formatPanel.alignChildren = 'left'
      var radioPortrait = formatPanel.add('radiobutton', undefined, 'portrait')
      var radioLandscape = formatPanel.add('radiobutton', undefined, 'landscape')
      radioPortrait.value = true

      var footer = view.add ('group')
      footer.orientation = 'row'
      var btnContinue = footer.add("button", undefined, "Continue")
      var btnClose = footer.add("button", undefined, "Cancel")

      selector.addEventListener('change', function() {
        self.outputDevice = this.selection.text
      })

      btnClose.addEventListener('click', function() {
        view.close()
      })

      btnContinue.addEventListener('click', function() {
        self.outputOrientation = radioPortrait.value ? radioPortrait.text : radioLandscape.text;
        self.outputDevice = selector.selection.text;
        self.keepAspect = (selectorAspect.selection.text === 'Yes') ? true : false
        view.close();
        self.openFolder();
        return;
      });

      view.show()
    },

    openFolder: function() {
      var fileList = this.inputFolder.getFiles('*.psd');
      for (var i = 0; i < fileList.length; ++i) {
        this.mainFile = open(fileList[i])
        this.resize()
        Helpers.savePSD(Helpers.createFolder(this.saveFolder + this.outputDevice + '/') + this.mainFile.name)
        activeDocument.close(SaveOptions.DONOTSAVECHANGES)
      }
    },

    isValidDevice: function() {
      var output = false
      for (var device in this.devices) {
        if (this.devices.hasOwnProperty(device) && device === this.outputDevice) {
          output = true
        }
      }
      return output
    },

    resize: function() {
      if (!documents.length) return;
      if (this.isValidDevice()) {
        this.doResizing(activeDocument, this.devices[this.outputDevice])
      } else {
        alert('Wrong device:' + this.outputDevice)
      }
    },

    doResizing: function(document, sizes) {
      var artboardSize;
      var width;
      var height;
      var currentLayer;
      var wrapperLayerGroup;
      var gap = 30;

      if (this.outputOrientation === 'portrait') {
        width = sizes[0];
        height = sizes[1];
      } else if(this.outputOrientation === 'landscape') {
        width = sizes[1];
        height = sizes[0];
      }

      for (var i = 0; i < activeDocument.layerSets.length; ++i) {
        activeDocument.activeLayer = activeDocument.layers.getByName(activeDocument.layerSets[i].name)

        if (Helpers.isArtboard()) {
          Helpers.resizeArtboard(Helpers.targetLayers(), Helpers.resizeArtboardRect(width, height, gap))
          wrapperLayerGroup = activeDocument.activeLayer.layerSets[0]

          if (wrapperLayerGroup.layerSets && wrapperLayerGroup.layerSets.length > 0) {
            if (wrapperLayerGroup.layerSets[0].name == 'texts') {
              activeDocument.activeLayer = wrapperLayerGroup.layerSets[0]
              Helpers.createSmartObject()
            }
          }

          activeDocument.activeLayer = wrapperLayerGroup
          Helpers.fitLayerToCanvas(width, height, this.keepAspect)
        }
      }
    }
  }

  return ImagesResizer

})()

////////////////////////////////////

new ImagesResizer()
