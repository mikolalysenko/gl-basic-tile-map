"use strict"

var createTexture = require("gl-texture2d")
var createShader = require("gl-shader")
var fillScreen = require("a-big-triangle")
var glm = require("gl-matrix")
var mat3 = glm.mat3

var scratchMatrix = mat3.create()

function TileMap(gl, tileSheet, tileMap, tileShape) {
  this.gl = gl
  this.tileSheet = tileSheet
  this.tileMap = tileMap
  this.tileShape = tileShape
}

TileMap.prototype.update = function(data, x, y) {
  this.tileMap.setPixels(data, x, y, 0)
}

TileMap.prototype.draw = function(view) {
  var gl = this.gl
  var shader = gl.__TILEMAP_SHADER
  
  shader.bind()
  shader.uniforms.tileSize = this.tileShape
  shader.uniforms.sheetSize = this.tileSheet.shape
  shader.uniforms.mapSize = this.tileMap.shape
  shader.uniforms.tileMap = this.tileMap.bind(0)
  shader.uniforms.tileSheet = this.tileSheet.bind(1)
  
  if(view) {
    shader.uniforms.view = mat3.invert(scratchMatrix, view)
  } else {
    shader.uniforms.view = mat3.identity(scratchMatrix)
  }
  
  fillScreen(gl)
}

TileMap.prototype.dispose = function() {
  this.tileMap.dispose()
}

function createTileMapShader(gl) {
  var shader = createShader(gl,
    "attribute vec2 position;\
    uniform mat3 view;\
    varying vec3 worldCoord;\
    void main() {\
      worldCoord = view * vec3(position, 1.0);\
      gl_Position = vec4(position, 0.0, 1.0);\
    }",
    "precision highp float;\
    uniform vec2 mapSize;\
    uniform vec2 sheetSize;\
    uniform vec2 tileSize;\
    uniform sampler2D tileMap;\
    uniform sampler2D tileSheet;\
    varying vec3 worldCoord;\
    void main() {\
      vec2 uv = worldCoord.xy / worldCoord.z;\
      vec2 mapCoord = floor(uv);\
      vec2 tileOffset = fract(uv);\
      vec2 tileId = floor(255.0 * texture2D(tileMap, mapCoord / mapSize).ra);\
      vec2 sheetCoord = (tileId + tileOffset) * (tileSize / sheetSize);\
      gl_FragColor = texture2D(tileSheet, sheetCoord);\
    }")
  return shader
}

function createTileMap(gl, tileSheet, tileMap, tileShape) {
  if(tileMap.shape.length !== 3 && tileMap[2] !== 2) {
    throw new Error("Invalid shape for tilemap")
  }
  if(!gl.__TILEMAP_SHADER) {
    gl.__TILEMAP_SHADER = createTileMapShader(gl)
  }
  var texture = createTexture(gl, tileMap)
  texture.wrapS = gl.REPEAT
  texture.wrapT = gl.REPEAT
  texture.minFilter = gl.NEAREST
  texture.magFilter = gl.NEAREST
  return new TileMap(gl, tileSheet, texture, tileShape)
}

module.exports = createTileMap
