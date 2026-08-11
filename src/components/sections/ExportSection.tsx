import { useAtom } from "jotai";
import {
  FileCodeIcon,
  FileImageIcon,
  FileTypeIcon,
  VideoIcon,
} from "lucide-react";
import type React from "react";
import { recordingStateAtom } from "../../state/sketchStore";

interface Props {
  onExportJpg: () => void;
  onExportSvg: () => void;
  onStartRecord: () => void;
  onStopRecord: () => void;
  onImportJson: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ExportSection: React.FC<Props> = ({
  onExportJpg,
  onExportSvg,
  onStartRecord,
  onStopRecord,
  onImportJson,
}) => {
  const [recordingState] = useAtom(recordingStateAtom);

  return (
    <div className="space-y-3 bg-gray-50/70 p-3.5 rounded-md border border-gray-200">
      <div className="font-bold text-emerald-700 flex items-center gap-2">
        <FileCodeIcon className="w-4 h-4" /> 出力
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onExportJpg}
          title="縦横2880pxの高解像度JPG画像とJSONを出力します"
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition flex items-center justify-center gap-1.5 text-xs cursor-pointer shadow-sm"
        >
          <FileImageIcon className="w-4 h-4" /> 高解像度JPG
        </button>
        <button
          type="button"
          onClick={onExportSvg}
          title="p5.js-svg を使用してベクターSVG画像を出力します"
          className="bg-teal-600 hover:bg-teal-700 text-white py-2 rounded font-semibold transition flex items-center justify-center gap-1.5 text-xs cursor-pointer shadow-sm"
        >
          <FileTypeIcon className="w-4 h-4" /> SVG
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={recordingState.isRecording}
          onClick={onStartRecord}
          title="mp4-muxer / WebCodecs (またはWebM) で動画録画を開始します (Rキー)"
          className="bg-red-600 hover:bg-red-700 text-white py-2 rounded font-semibold transition flex items-center justify-center gap-1.5 text-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
        >
          <VideoIcon className="w-4 h-4" /> 録画開始 (MP4)
        </button>
        <button
          type="button"
          disabled={!recordingState.isRecording}
          onClick={onStopRecord}
          title="録画を停止して動画とJSONを出力します (Sキー)"
          className="bg-white hover:bg-gray-100 disabled:opacity-40 text-gray-800 border border-gray-300 py-2 rounded font-semibold transition flex items-center justify-center gap-1.5 text-xs cursor-pointer disabled:cursor-not-allowed shadow-sm"
        >
          <VideoIcon className="w-4 h-4" /> 録画停止
        </button>
      </div>

      {/* JSON File Import */}
      <div
        className="pt-2 border-t border-gray-200"
        title="過去に保存したJSONファイルを読み込んで設定を再現します"
      >
        <label className="text-gray-600 font-medium block mb-1" htmlFor="file-json-input">
          JSON設定ファイルの読み込み
        </label>
        <input
          type="file"
          id="file-json-input"
          accept=".json"
          onChange={onImportJson}
          className="w-full text-xs text-gray-600 file:mr-2 file:py-1 file:px-3 file:rounded file:border file:border-gray-300 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-800 hover:file:bg-gray-200 cursor-pointer"
        />
      </div>
    </div>
  );
};
