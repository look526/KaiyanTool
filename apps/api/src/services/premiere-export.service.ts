import { prisma } from '../lib/prisma';

interface ExportConfig {
  format: 'prproj' | 'aep' | 'edl' | 'xml';
  resolution: '720p' | '1080p' | '4k';
  frameRate: 24 | 25 | 30 | 60;
  includeAudio: boolean;
  includeMarkers: boolean;
}

interface ProjectData {
  id: string;
  name: string;
  shots: ShotData[];
  assets: AssetData[];
  duration: number;
}

interface ShotData {
  id: string;
  sequence: number;
  duration: number;
  startFrame?: string;
  endFrame?: string;
  videoUrl?: string;
  dialogue?: string;
  notes?: string;
}

interface AssetData {
  id: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  name: string;
  duration?: number;
  width?: number;
  height?: number;
}

export class PremiereExportService {
  async generateProject(projectId: string, config: ExportConfig): Promise<string> {
    const project = await this.loadProject(projectId);
    
    switch (config.format) {
      case 'prproj':
        return this.generatePRPROJ(project, config);
      case 'aep':
        return this.generateAEP(project, config);
      case 'edl':
        return this.generateEDL(project, config);
      case 'xml':
        return this.generateXML(project, config);
      default:
        throw new Error(`Unsupported format: ${config.format}`);
    }
  }

  private async loadProject(projectId: string): Promise<ProjectData> {
    const shots = await prisma.shot.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' }
    });

    const assets = await prisma.asset.findMany({
      where: { projectId }
    });

    const totalDuration = shots.reduce((acc, shot) => acc + (shot.duration || 5), 0);

    return {
      id: projectId,
      name: `Project_${projectId}`,
      shots: shots.map((shot, index) => ({
        id: shot.id,
        sequence: index + 1,
        duration: shot.duration || 5,
        videoUrl: (shot as any).videoUrl,
        dialogue: (shot as any).dialogue,
        notes: (shot as any).notes
      })),
      assets: assets.map(asset => ({
        id: asset.id,
        type: asset.type as 'image' | 'video' | 'audio',
        url: asset.url,
        name: asset.name || `Asset_${asset.id}`,
        duration: asset.metadata?.duration,
        width: asset.metadata?.width,
        height: asset.metadata?.height
      })),
      duration: totalDuration
    };
  }

  private generatePRPROJ(project: ProjectData, config: ExportConfig): string {
    const width = { '720p': 1280, '1080p': 1920, '4k': 3840 }[config.resolution];
    const height = { '720p': 720, '1080p': 1080, '4k': 2160 }[config.resolution];
    const fps = { 24: '23976', 25: '25000', 30: '30000', 60: '60000' }[config.frameRate];

    const sequences = this.buildSequences(project, config);
    const mediaPool = this.buildMediaPool(project);
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<PremiereData Version="23">
  <Project Name="${project.name}" ObjectVersion="68" Label="1">
    <ProjectTree>
      ${sequences.map((seq, idx) => `
      <Sequence ObjectID="${1000 + idx}" ClassID="DA7F230F-9857-4d6d-A6C0-34B0A68D4E56" Name="${seq.name}">
        <SequenceID>${seq.id}</SequenceID>
        <Duration>${seq.duration}</Duration>
        <Rate>
          <Timebase>${config.frameRate}</Timebase>
          <Ntsc>FALSE</Ntsc>
        </Rate>
        <Media>
          ${seq.tracks.map((track, tIdx) => `
          <Track ObjectID="${2000 + tIdx}" TrackType="${track.type}">
            ${track.clips.map((clip, cIdx) => `
            <ClipItem ObjectID="${3000 + cIdx}" ClassID="${clip.classID}">
              <Name>${clip.name}</Name>
              <Duration>${clip.duration}</Duration>
              <Start>${clip.start}</Start>
              <End>${clip.end}</End>
              <InPoint>${clip.inPoint}</InPoint>
              <OutPoint>${clip.outPoint}</OutPoint>
              <MasterClipID>${clip.masterClipID}</MasterClipID>
              <SourceTrackID>${clip.sourceTrackID}</SourceTrackID>
            </ClipItem>
            `).join('')}
          </Track>
          `).join('')}
        </Media>
      </Sequence>
      `).join('')}
    </ProjectTree>
    <MediaPool>
      ${mediaPool.map((media, mIdx) => `
      <Media ObjectID="${4000 + mIdx}" Type="${media.type}" OriginalFilename="${media.filename}">
        <Path>${media.path}</Path>
        <Width>${media.width || width}</Width>
        <Height>${media.height || height}</Height>
        <Duration>${media.duration}</Duration>
      </Media>
      `).join('')}
    </MediaPool>
    <Settings>
      <Video>
        <OutputAspectRatio>
          <Numerator>${width}</Numerator>
          <Denominator>${height}</Denominator>
        </OutputAspectRatio>
        <FrameSize>
          <Horizontal>${width}</Horizontal>
          <Vertical>${height}</Vertical>
        </FrameSize>
        <FrameRate>${fps}</FrameRate>
      </Video>
      <Audio>
        <OutputSampleRate>48000</OutputSampleRate>
        <BitDepth>24</BitDepth>
      </Audio>
    </Settings>
  </Project>
</PremiereData>`;
  }

  private generateAEP(project: ProjectData, config: ExportConfig): string {
    const width = { '720p': 1280, '1080p': 1920, '4k': 3840 }[config.resolution];
    const height = { '720p': 720, '1080p': 1080, '4k': 2160 }[config.resolution];
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<AfterEffectsProject>
  <Project>
    <ProjectName>${project.name}</ProjectName>
    <Version>24.0</Version>
    <Settings>
      <Composition>
        <Width>${width}</Width>
        <Height>${height}</Height>
        <FrameRate>${config.frameRate}</FrameRate>
        <Duration>${project.duration}</Duration>
      </Composition>
      <Video>
        <PixelAspectRatio>1</PixelAspectRatio>
        <ShutterAngle>180</ShutterAngle>
      </Video>
    </Settings>
    <Items>
      ${project.shots.map((shot, idx) => `
      <Composition ObjectID="${1000 + idx}">
        <Name>Shot_${shot.sequence}</Name>
        <Duration>${shot.duration}</Duration>
        <Width>${width}</Width>
        <Height>${height}</Height>
        <Layers>
          <Layer ObjectID="${2000 + idx}" Type="Footage">
            <Name>Shot_${shot.sequence}</Name>
            <SourceFile>${shot.videoUrl || ''}</SourceFile>
            <InPoint>0</InPoint>
            <OutPoint>${shot.duration}</OutPoint>
            <StartTime>0</StartTime>
            ${config.includeMarkers && shot.notes ? `
            <Marker>
              <Comment>${shot.notes}</Comment>
            </Marker>
            ` : ''}
          </Layer>
        </Layers>
      </Composition>
      `).join('')}
    </Items>
    <Footage>
      ${project.assets.map((asset, idx) => `
      <Footage ObjectID="${3000 + idx}">
        <Name>${asset.name}</Name>
        <FilePath>${asset.url}</FilePath>
        <Width>${asset.width || width}</Width>
        <Height>${asset.height || height}</Height>
        <Duration>${asset.duration || 5}</Duration>
      </Footage>
      `).join('')}
    </Footage>
  </Project>
</AfterEffectsProject>`;
  }

  private generateEDL(project: ProjectData, config: ExportConfig): string {
    let edl = `TITLE: ${project.name}\nFCM: NON-DROP FRAME\n\n`;
    
    let currentTimecode = 0;
    
    project.shots.forEach((shot, idx) => {
      const sourceIn = 0;
      const sourceOut = shot.duration * config.frameRate;
      const recIn = currentTimecode;
      const recOut = recIn + sourceOut;
      
      const formatTimecode = (frames: number): string => {
        const totalSeconds = Math.floor(frames / config.frameRate);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const frame = frames % config.frameRate;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${frame.toString().padStart(2, '0')}`;
      };
      
      edl += `${(idx + 1).toString().padStart(3, '0')}  V     C        ${formatTimecode(recIn)} ${formatTimecode(recOut)} ${formatTimecode(sourceIn)} ${formatTimecode(sourceOut)}\n`;
      edl += `* FROM CLIP NAME: Shot_${shot.sequence}\n`;
      if (config.includeAudio) {
        edl += `* AUDIO: ${project.assets.find(a => a.type === 'audio') ? 'YES' : 'NO'}\n`;
      }
      edl += `\n`;
      
      currentTimecode = recOut;
    });
    
    return edl;
  }

  private generateXML(project: ProjectData, config: ExportConfig): string {
    const width = { '720p': 1280, '1080p': 1920, '4k': 3840 }[config.resolution];
    const height = { '720p': 720, '1080p': 1080, '4k': 2160 }[config.resolution];
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<xmeml version="4">
  <sequence>
    <name>${project.name}</name>
    <duration>${project.duration * config.frameRate}</duration>
    <rate>
      <timebase>${config.frameRate}</timebase>
      <ntsc>FALSE</ntsc>
    </rate>
    <media>
      <video>
        <track>
          ${project.shots.map((shot, idx) => `
          <clipitem>
            <name>Shot_${shot.sequence}</name>
            <start>${idx * shot.duration * config.frameRate}</start>
            <end>${(idx + 1) * shot.duration * config.frameRate}</end>
            <in>${0}</in>
            <out>${shot.duration * config.frameRate}</out>
            <file>
              <name>Shot_${shot.sequence}.mp4</name>
              <pathurl>${shot.videoUrl || ''}</pathurl>
            </file>
            <link>
              ${config.includeAudio ? `
              <linkclipref>Audio_Shot_${shot.sequence}</linkclipref>
              <mediatype>audio</mediatype>
              ` : ''}
            </link>
          </clipitem>
          `).join('')}
        </track>
        <format>
          <samplecharacteristics>
            <width>${width}</width>
            <height>${height}</height>
            <rate>
              <timebase>${config.frameRate}</timebase>
            </rate>
          </samplecharacteristics>
        </format>
      </video>
      ${config.includeAudio ? `
      <audio>
        <track>
          ${project.shots.map((shot, idx) => `
          <clipitem>
            <name>Audio_Shot_${shot.sequence}</name>
            <start>${idx * shot.duration * config.frameRate}</start>
            <end>${(idx + 1) * shot.duration * config.frameRate}</end>
          </clipitem>
          `).join('')}
        </track>
      </audio>
      ` : ''}
    </media>
  </sequence>
</xmeml>`;
  }

  private buildSequences(project: ProjectData, config: ExportConfig) {
    return project.shots.map((shot, idx) => ({
      id: `seq_${shot.id}`,
      name: `Sequence_${idx + 1}`,
      duration: shot.duration * config.frameRate,
      tracks: [
        { type: 'Video', clips: this.buildVideoClips(shot, config) },
        ...(config.includeAudio ? [{ type: 'Audio', clips: this.buildAudioClips(shot) }] : [])
      ]
    }));
  }

  private buildVideoClips(shot: ShotData, config: ExportConfig) {
    return [{
      classID: 'AA4625C2-747B-4c0f-8BE3-9A2A74D6B27F',
      name: `Shot_${shot.sequence}`,
      duration: shot.duration * config.frameRate,
      start: 0,
      end: shot.duration * config.frameRate,
      inPoint: 0,
      outPoint: shot.duration * config.frameRate,
      masterClipID: `master_${shot.id}`,
      sourceTrackID: 1
    }];
  }

  private buildAudioClips(shot: ShotData) {
    return [{
      classID: 'AB94C2D1-5D6A-4d6f-8E50-4A7A6E9D5F2C',
      name: `Audio_${shot.sequence}`,
      duration: shot.duration * 48000,
      start: 0,
      end: shot.duration * 48000,
      inPoint: 0,
      outPoint: shot.duration * 48000,
      masterClipID: `audio_${shot.id}`,
      sourceTrackID: 1
    }];
  }

  private buildMediaPool(project: ProjectData) {
    const media = new Map();
    
    project.shots.forEach((shot, idx) => {
      if (shot.videoUrl) {
        media.set(shot.videoUrl, {
          type: 'video',
          filename: `Shot_${shot.sequence}.mp4`,
          path: shot.videoUrl,
          duration: shot.duration,
          width: 1920,
          height: 1080
        });
      }
    });
    
    project.assets.forEach(asset => {
      if (asset.url && !media.has(asset.url)) {
        media.set(asset.url, {
          type: asset.type,
          filename: `${asset.name}.${asset.type === 'video' ? 'mp4' : asset.type === 'audio' ? 'wav' : 'png'}`,
          path: asset.url,
          duration: asset.duration,
          width: asset.width,
          height: asset.height
        });
      }
    });
    
    return Array.from(media.values());
  }
}

export const premiereExportService = new PremiereExportService();
