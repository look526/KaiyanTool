import { sceneInputToDbFields } from '../../services/script/apply-parse.service'

describe('sceneInputToDbFields', () => {
  it('maps V1 snake_case dialogues', () => {
    const r = sceneInputToDbFields({
      location: '客厅',
      time: '夜',
      description: '',
      dialogues: [{ character_name: '甲', text: '你好' }],
    })
    expect(r.location).toBe('客厅')
    expect(r.time).toBe('夜')
    expect(r.description).toContain('甲')
    expect(r.description).toContain('你好')
    expect(r.action_summary.length).toBeGreaterThan(0)
  })

  it('falls back to heading and preview dialogue shape', () => {
    const r = sceneInputToDbFields({
      heading: '外景',
      dialogues: [{ characterName: 'B', lines: ['行'] }],
    })
    expect(r.location).toBe('外景')
    expect(r.description).toContain('B')
  })
})
