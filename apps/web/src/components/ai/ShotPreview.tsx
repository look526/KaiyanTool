import { Eye, Clock, User, Move, Film } from 'lucide-react';

interface ScriptShot {
  id: string;
  sceneId: string;
  number: number;
  description: string;
  cameraMovement?: string;
  duration: number;
  characters: string[];
}

interface ScriptScene {
  id: string;
  number: number;
  heading: string;
  location: string;
  time?: string;
  description?: string;
  characters: string[];
  shots: ScriptShot[];
}

interface ShotPreviewProps {
  scenes: ScriptScene[];
}

export function ShotPreview({ scenes }: ShotPreviewProps) {
  const totalShots = scenes.reduce((sum, scene) => sum + scene.shots.length, 0);
  const totalDuration = scenes.reduce((sum, scene) => sum + scene.shots.reduce((shotSum, shot) => shotSum + shot.duration, 0), 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Film className="w-5 h-5 text-purple-500" />
          <h3 className="font-semibold">镜头预览</h3>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>共 {scenes.length} 场景</span>
          <span>共 {totalShots} 镜头</span>
          <span>预估时长: {totalDuration} 秒</span>
        </div>
      </div>

      <div className="space-y-6">
        {scenes.map((scene) => (
          <div key={scene.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 font-medium">
                  {scene.number}
                </div>
                <div>
                  <h4 className="font-medium">{scene.heading}</h4>
                  <p className="text-sm text-gray-500">{scene.location} {scene.time ? `· ${scene.time}` : ''}</p>
                </div>
              </div>
              <span className="text-sm px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded">
                {scene.shots.length} 镜头
              </span>
            </div>

            <div className="space-y-3">
              {scene.shots.map((shot) => (
                <div key={shot.id} className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 text-xs font-medium">
                      {shot.number}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h5 className="font-medium text-sm">镜头 {shot.number}</h5>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{shot.duration}秒</span>
                        {shot.cameraMovement && (
                          <>
                            <Move className="w-3 h-3" />
                            <span>{shot.cameraMovement}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {shot.description}
                    </p>
                    {shot.characters.length > 0 && (
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-500">
                          {shot.characters.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
