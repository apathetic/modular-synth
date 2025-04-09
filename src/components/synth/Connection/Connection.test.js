import { mount, shallowMount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import Connection from './Connection.vue'
import { useAppStore } from '@/stores/app'
import { Parameter } from '@/audio'

// Mock the store
vi.mock('@/stores/app', () => ({
  useAppStore: vi.fn()
}))

// Mock the audio Parameter class
vi.mock('@/audio', () => ({
  Parameter: vi.fn().mockImplementation(() => ({
    set: vi.fn(),
    output: {
      connect: vi.fn()
    },
    destroy: vi.fn()
  }))
}))

// Mock the logger
vi.mock('@/utils/logger', () => ({
  log: vi.fn()
}))

describe('Connection.vue', () => {
  let mockStore
  let mockSourceNode
  let mockDestNode
  let mockSourceModule
  let mockDestModule
  let mockSourceRackUnit
  let mockDestRackUnit

  beforeEach(() => {
    // Create mock audio nodes with inlets and outlets
    mockSourceNode = {
      outlets: [
        { audio: { connect: vi.fn(), disconnect: vi.fn() } },
        { data: 'frequency', audio: null }
      ],
      $watch: vi.fn().mockReturnValue(vi.fn()) // Return a function that can be called to unwatch
    }

    mockDestNode = {
      inlets: [
        { audio: { connect: vi.fn() } },
        { data: vi.fn(), audio: null }
      ]
    }

    // Create mock modules with position data
    mockSourceModule = {
      type: 'oscillator',
      x: 100,
      y: 100
    }

    mockDestModule = {
      type: 'gain',
      x: 200,
      y: 200
    }

    // Create mock RackUnits with module and node properties
    mockSourceRackUnit = {
      id: 1,
      module: mockSourceModule,
      node: mockSourceNode
    }

    mockDestRackUnit = {
      id: 2,
      module: mockDestModule,
      node: mockDestNode
    }

    // Setup mock store
    mockStore = {
      getRackUnit: vi.fn((id) => {
        if (id === 1) return mockSourceRackUnit
        if (id === 2) return mockDestRackUnit
        return undefined
      }),
      removeConnection: vi.fn()
    }

    useAppStore.mockReturnValue(mockStore)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders a line with correct coordinates', () => {
    const _wrapper = shallowMount(Connection, {
      props: {
        id: 1,
        from: { id: 1, port: 0 },
        to: { id: 2, port: 0 },
        type: 'audio'
      }
    })

    const line = _wrapper.find('line')
    expect(line.exists()).toBe(true)
    expect(line.attributes('x1')).toBeDefined()
    expect(line.attributes('y1')).toBeDefined()
    expect(line.attributes('x2')).toBeDefined()
    expect(line.attributes('y2')).toBeDefined()
  })

  it('connects audio nodes when both have audio ports', () => {
    mount(Connection, {
      props: {
        id: 1,
        from: { id: 1, port: 0 },
        to: { id: 2, port: 0 },
        type: 'audio'
      }
    })

    // Check that the audio connection was made
    expect(mockSourceNode.outlets[0].audio.connect).toHaveBeenCalledWith(mockDestNode.inlets[0].audio)
  })

  it('sets up data to audio connection with Parameter', () => {
    mount(Connection, {
      props: {
        id: 1,
        from: { id: 1, port: 1 }, // Data port
        to: { id: 2, port: 0 },   // Audio port
        type: 'mixed'
      }
    })

    // Check that Parameter was created and connected
    expect(Parameter).toHaveBeenCalled()
    expect(mockSourceNode.$watch).toHaveBeenCalled()
  })

  it('sets up data to data connection with $watch', () => {
    // Mock data outlet and inlet
    mockSourceNode.outlets[1] = { data: 'frequency', audio: null }
    mockDestNode.inlets[1] = { data: vi.fn(), audio: null }

    mount(Connection, {
      props: {
        id: 1,
        from: { id: 1, port: 1 }, // Data port
        to: { id: 2, port: 1 },   // Data port
        type: 'data'
      }
    })

    // Check that $watch was set up
    expect(mockSourceNode.$watch).toHaveBeenCalledWith('frequency', expect.any(Function))
  })

  it('removes connection when clicked', async () => {
    const _wrapper = shallowMount(Connection, {
      props: {
        id: 1,
        from: { id: 1, port: 0 },
        to: { id: 2, port: 0 },
        type: 'audio'
      }
    })

    await _wrapper.find('line').trigger('click')
    expect(mockStore.removeConnection).toHaveBeenCalledWith(1)
  })

  it('disconnects audio nodes on unmount', async () => {
    const _wrapper = mount(Connection, {
      props: {
        id: 1,
        from: { id: 1, port: 0 },
        to: { id: 2, port: 0 },
        type: 'audio'
      }
    })

    _wrapper.unmount()
    expect(mockSourceNode.outlets[0].audio.disconnect).toHaveBeenCalledWith(mockDestNode.inlets[0].audio)
  })

  it('handles missing rackUnits gracefully', () => {
    // Mock store to return undefined for rackUnits
    mockStore.getRackUnit.mockReturnValue(undefined)

    const _wrapper = shallowMount(Connection, {
      props: {
        id: 1,
        from: { id: 1, port: 0 },
        to: { id: 2, port: 0 },
        type: 'audio'
      }
    })

    // Should not throw and should call removeConnection
    expect(mockStore.removeConnection).toHaveBeenCalledWith(1)
  })

  it('handles connection errors gracefully', () => {
    // Make connect throw an error
    mockSourceNode.outlets[0].audio.connect.mockImplementation(() => {
      throw new Error('Connection error')
    })

    mount(Connection, {
      props: {
        id: 1,
        from: { id: 1, port: 0 },
        to: { id: 2, port: 0 },
        type: 'audio'
      }
    })

    // Should call removeConnection when error occurs
    expect(mockStore.removeConnection).toHaveBeenCalledWith(1)
  })
})
