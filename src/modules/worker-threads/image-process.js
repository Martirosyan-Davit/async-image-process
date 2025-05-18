"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var worker_threads_1 = require("worker_threads");
var axios_1 = __importDefault(require("axios"));
var promises_1 = __importDefault(require("fs/promises"));
var path_1 = __importDefault(require("path"));
var sharp_1 = __importDefault(require("sharp"));
var uuid_1 = require("uuid");
// Worker threads run in isolation, so we need to configure SD API URL directly
var SD_API_URL = process.env.SD_API_URL || 'http://localhost:7860';
function processImage(prompt) {
    return __awaiter(this, void 0, void 0, function () {
        var img2imgEndpoint, extraImageEndpoint, initImagePath, controlImagePath, initImageBase64, controlImageBase64, payload, response, base64Image, pixelPayload, pixelResponse, pixelImageBase64, buffer, processedBuffer, data, info, transparentPixels, i, r, g, b, a, finalImageBuffer, filename, filePath, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 8, , 9]);
                    img2imgEndpoint = "".concat(SD_API_URL, "/sdapi/v1/img2img");
                    extraImageEndpoint = "".concat(SD_API_URL, "/sdapi/v1/extra-single-image");
                    initImagePath = path_1.default.join(process.cwd(), 'static', 'animations', 'character_base.png');
                    controlImagePath = path_1.default.join(process.cwd(), 'static', 'animations', 'character_bones.png');
                    return [4 /*yield*/, promises_1.default.readFile(initImagePath, {
                            encoding: 'base64',
                        })];
                case 1:
                    initImageBase64 = _a.sent();
                    return [4 /*yield*/, promises_1.default.readFile(controlImagePath, {
                            encoding: 'base64',
                        })];
                case 2:
                    controlImageBase64 = _a.sent();
                    payload = {
                        prompt: prompt,
                        negative_prompt: 'EasyNegative, watermark, text',
                        steps: 25,
                        width: 848,
                        height: 1600,
                        sampler_name: 'Euler a',
                        cfg_scale: 10,
                        denoising_strength: 0.75,
                        init_images: [initImageBase64],
                        alwayson_scripts: {
                            controlnet: {
                                args: [
                                    {
                                        enabled: true,
                                        image: controlImageBase64,
                                        module: 'none',
                                        model: 'controlnetxlCNXL_2vxpswa7OpenposeV21 [0d95a9db]',
                                        weight: 1,
                                        resize_mode: 'Crop and Resize',
                                        processor_res: 1600,
                                        threshold_a: 0.5,
                                        threshold_b: 0.5,
                                        guidance_start: 0,
                                        guidance_end: 1,
                                        control_mode: 'ControlNet is more important',
                                        pixel_perfect: false,
                                    },
                                ],
                            },
                        },
                    };
                    return [4 /*yield*/, axios_1.default.post(img2imgEndpoint, payload)];
                case 3:
                    response = _a.sent();
                    base64Image = response.data.images[0];
                    pixelPayload = {
                        pixelization: true,
                        pixelization_value: 2,
                        pixelization_keep_res: true,
                        image: base64Image,
                    };
                    return [4 /*yield*/, axios_1.default.post(extraImageEndpoint, pixelPayload)];
                case 4:
                    pixelResponse = _a.sent();
                    pixelImageBase64 = pixelResponse.data.image;
                    buffer = Buffer.from(pixelImageBase64, 'base64');
                    return [4 /*yield*/, (0, sharp_1.default)(buffer)
                            .ensureAlpha()
                            .raw()
                            .toBuffer({ resolveWithObject: true })];
                case 5:
                    processedBuffer = _a.sent();
                    data = processedBuffer.data, info = processedBuffer.info;
                    transparentPixels = Buffer.alloc(data.length);
                    for (i = 0; i < data.length; i += 4) {
                        r = data[i];
                        g = data[i + 1];
                        b = data[i + 2];
                        a = data[i + 3];
                        if (r > 240 && g > 240 && b > 240) {
                            transparentPixels[i] = 255;
                            transparentPixels[i + 1] = 255;
                            transparentPixels[i + 2] = 255;
                            transparentPixels[i + 3] = 0;
                        }
                        else {
                            transparentPixels[i] = r;
                            transparentPixels[i + 1] = g;
                            transparentPixels[i + 2] = b;
                            transparentPixels[i + 3] = a;
                        }
                    }
                    return [4 /*yield*/, (0, sharp_1.default)(transparentPixels, {
                            raw: {
                                width: info.width,
                                height: info.height,
                                channels: 4,
                            },
                        })
                            .png()
                            .toBuffer()];
                case 6:
                    finalImageBuffer = _a.sent();
                    filename = "animation_".concat((0, uuid_1.v4)(), ".png");
                    filePath = path_1.default.join('static', 'animations', filename);
                    return [4 /*yield*/, promises_1.default.writeFile(filePath, finalImageBuffer)];
                case 7:
                    _a.sent();
                    return [2 /*return*/, filePath];
                case 8:
                    error_1 = _a.sent();
                    console.error('Worker error:', error_1);
                    return [2 /*return*/, null];
                case 9: return [2 /*return*/];
            }
        });
    });
}
// Run the function with the prompt passed from the main thread
processImage(worker_threads_1.workerData)
    .then(function (filePath) {
    if (worker_threads_1.parentPort) {
        worker_threads_1.parentPort.postMessage(filePath);
    }
})
    .catch(function (error) {
    console.error('Worker error:', error);
    if (worker_threads_1.parentPort) {
        worker_threads_1.parentPort.postMessage(null);
    }
});
