var shell = require("gl-now")()
var ndarray = require("ndarray")
var tileMap = require("isabella-texture-pack")
var createTexture = require("gl-texture2d")
var glm = require("gl-matrix")
var createTileMap = require("../tilemap.js")
var mat3 = glm.mat3

var tiles = ndarray(new Uint8Array(128*128*2), [128,128,2])
var cameraPosition = [0,0]
var cameraScale = 0.01
var tileMap

shell.on("gl-init", function() {
  var gl = shell.gl
  
  var tileSheet = createTexture(gl, tileMap)
  tileMap = createTileMap(gl, tileSheet, tiles, [16,16])
  
  //Randomize all the tiles every second
  setInterval(function() {
    for(var i=0; i<128; ++i) {
      for(var j=0; j<128; ++j) {
        tiles.set(i, j, 0, (Math.random()*16)|0)
        tiles.set(i, j, 1, (Math.random()*16)|0)
      }
    }
    tileMap.update(tiles)
  }, 1000)
})

shell.on("gl-render", function() {
  var view = [cameraScale, 0, 0,
              0, cameraScale, 0,
              cameraPosition[0], cameraPosition[1], 1]
  tileMap.draw(view)
})

shell.on("tick", function() {
  if(shell.wasDown("mouse-1")) {
    cameraPosition[0] += (shell.mouseX - shell.prevMouseX) / shell.width
    cameraPosition[1] -= (shell.mouseY - shell.prevMouseY) / shell.height
  }
  if(shell.scroll[1]) {
    cameraScale *= Math.exp(shell.scroll[1] / shell.height)
  }
})