gl-basic-tile-map
=================
Simple 2D tile map renderer in WebGL.

## Example

```javascript
var shell = require("gl-now")()
var ndarray = require("ndarray")
var tileMap = require("isabella-texture-pack")
var createTexture = require("gl-texture2d")
var glm = require("gl-matrix")
var createTileMap = require("gl-basic-tile-map")
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
```

[Try it out now in your browser](http://mikolalysenko.github.io/gl-basic-tile-map/)

# Install

    npm install gl-basic-tile-map
    
# API

## Constructor

```javascript
var createTileMap = require("gl-basic-tile-map")
```

### `var tileMap = createTileMap(gl, tileSheet, tileData, tileShape)`
Creates a tile map object.

* `gl` is a handle to a WebGL context
* `tileSheet` is an instance of a `gl-texture2d` object
* `tileData` is an `[m,n,2]` shaped `ndarray`
* `tileShape` is a length 2 array describing the size of each tile

**Returns** A TileMap object

## TileMap Methods

### `tileMap.draw(view)`
Draws the tilemap with the given view matrix.  `view` is a homography represented by a 3x3 matrix giving the transformation from the world coordinates to the viewing frustum, which is in the coordinate system [-1,1] x [-1,1].

### `tileMap.update(data[, x, y])`
Updates a region of the underlying tileIds.

* `data` is an ndarray containing the new pixels to update
* `x` is the x-offset of the region to update
* `y` is the y-offset of the region to update

### `tileMap.dispose()`
Releases the resources associated with the tile map object.

## Credits
(c) 2013 Mikola Lysenko. MIT License