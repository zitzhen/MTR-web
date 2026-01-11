// composables/mtrApi.ts
import { ref } from 'vue'

// MTR API 服务配置
const DEFAULT_MTR_API_BASE_URL = 'http://localhost:8888'

// 定义API响应接口
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 定义轨道相关接口
interface RailInfo {
  id: string
  x1: number
  y1: number
  z1: number
  x2: number
  y2: number
  z2: number
  type: string
  block?: string
}

// 定义列车相关接口
interface TrainInfo {
  id: string
  name: string
  position: {
    x: number
    y: number
    z: number
  }
  speed: number
  status: string
  lineId?: string
  stationId?: string
}

// 定义车站相关接口
interface StationInfo {
  id: string
  name: string
  position: {
    x: number
    y: number
    z: number
  }
  connectedRails: string[]
}

/**
 * MTR API 服务
 * 用于与 Minecraft Transit Railway Transport Simulation Core 进行交互
 */
export const useMtrApi = (baseUrl: string = DEFAULT_MTR_API_BASE_URL) => {
  // API 基础请求函数
  const request = async <T = any>(
    endpoint: string,
    options: RequestInit = {},
    dimension?: string
  ): Promise<ApiResponse<T>> => {
    try {
      // 添加维度参数
      const url = new URL(`${baseUrl}${endpoint}`)
      if (dimension) {
        url.searchParams.append('dimension', dimension)
      }

      // 设置默认请求选项
      const requestOptions: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      }

      const response = await fetch(url.toString(), requestOptions)
      const data = await response.json()

      if (response.ok) {
        return {
          success: true,
          data,
        }
      } else {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          message: data?.message || 'Request failed',
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network error',
        message: 'Failed to connect to MTR server',
      }
    }
  }

  // 获取所有轨道信息
  const getRails = async (dimension?: string): Promise<ApiResponse<RailInfo[]>> => {
    return request<RailInfo[]>('/mtr/rails', {}, dimension)
  }

  // 获取特定轨道信息
  const getRail = async (railId: string, dimension?: string): Promise<ApiResponse<RailInfo>> => {
    return request<RailInfo>(`/mtr/rails/${railId}`, {}, dimension)
  }

  // 获取所有列车信息
  const getTrains = async (dimension?: string): Promise<ApiResponse<TrainInfo[]>> => {
    return request<TrainInfo[]>('/mtr/trains', {}, dimension)
  }

  // 获取特定列车信息
  const getTrain = async (trainId: string, dimension?: string): Promise<ApiResponse<TrainInfo>> => {
    return request<TrainInfo>(`/mtr/trains/${trainId}`, {}, dimension)
  }

  // 获取所有车站信息
  const getStations = async (dimension?: string): Promise<ApiResponse<StationInfo[]>> => {
    return request<StationInfo[]>('/mtr/stations', {}, dimension)
  }

  // 获取特定车站信息
  const getStation = async (stationId: string, dimension?: string): Promise<ApiResponse<StationInfo>> => {
    return request<StationInfo>(`/mtr/stations/${stationId}`, {}, dimension)
  }

  // 获取线路信息
  const getLines = async (dimension?: string): Promise<ApiResponse<any[]>> => {
    return request<any[]>(`/mtr/lines`, {}, dimension)
  }

  // 获取系统状态
  const getSystemStatus = async (dimension?: string): Promise<ApiResponse<any>> => {
    return request<any>(`/mtr/status`, {}, dimension)
  }

  // 发送控制命令给列车
  const sendTrainCommand = async (
    trainId: string,
    command: string,
    params?: Record<string, any>,
    dimension?: string
  ): Promise<ApiResponse<any>> => {
    return request(`/mtr/trains/${trainId}/command`, {
      method: 'POST',
      body: JSON.stringify({ command, params }),
    }, dimension)
  }

  // 获取模拟统计数据
  const getSimulationStats = async (dimension?: string): Promise<ApiResponse<any>> => {
    return request('/mtr/stats', {}, dimension)
  }

  // 获取所有路线信息
  const getRoutes = async (dimension?: string): Promise<ApiResponse<any[]>> => {
    return request<any[]>(`/mtr/routes`, {}, dimension)
  }

  // 获取列车时刻表
  const getTimetables = async (dimension?: string): Promise<ApiResponse<any[]>> => {
    return request<any[]>(`/mtr/timetables`, {}, dimension)
  }

  // 获取车站乘客信息
  const getStationPassengers = async (stationId: string, dimension?: string): Promise<ApiResponse<any>> => {
    return request<any>(`/mtr/stations/${stationId}/passengers`, {}, dimension)
  }

  // 获取轨道连接信息
  const getRailConnections = async (railId: string, dimension?: string): Promise<ApiResponse<any>> => {
    return request<any>(`/mtr/rails/${railId}/connections`, {}, dimension)
  }

  // 获取列车路径
  const getTrainPath = async (trainId: string, dimension?: string): Promise<ApiResponse<any>> => {
    return request<any>(`/mtr/trains/${trainId}/path`, {}, dimension)
  }

  // 获取列车状态
  const getTrainStatus = async (trainId: string, dimension?: string): Promise<ApiResponse<any>> => {
    return request<any>(`/mtr/trains/${trainId}/status`, {}, dimension)
  }

  // 获取系统配置
  const getSystemConfig = async (dimension?: string): Promise<ApiResponse<any>> => {
    return request<any>(`/mtr/config`, {}, dimension)
  }

  // 获取实时数据
  const getRealtimeData = async (dimension?: string): Promise<ApiResponse<any>> => {
    return request<any>(`/mtr/realtime`, {}, dimension)
  }

  return {
    // 基础请求函数
    request,
    
    // 轨道相关API
    getRails,
    getRail,
    getRailConnections,
    
    // 列车相关API
    getTrains,
    getTrain,
    getTrainPath,
    getTrainStatus,
    sendTrainCommand,
    
    // 车站相关API
    getStations,
    getStation,
    getStationPassengers,
    
    // 线路相关API
    getLines,
    getRoutes,
    
    // 时刻表相关API
    getTimetables,
    
    // 系统相关API
    getSystemStatus,
    getSystemConfig,
    getSimulationStats,
    getRealtimeData,
  }
}

// 创建一个全局实例用于检查服务器连接状态
export const useMtrServerStatus = (baseUrl: string = DEFAULT_MTR_API_BASE_URL) => {
  const isConnected = ref(false)
  const serverStatus = ref<any>(null)
  const isChecking = ref(false)

  const checkConnection = async (dimension?: string) => {
    isChecking.value = true
    try {
      const api = useMtrApi(baseUrl)
      const response = await api.getSystemStatus(dimension)
      
      if (response.success) {
        isConnected.value = true
        serverStatus.value = response.data
      } else {
        isConnected.value = false
      }
    } catch (error) {
      isConnected.value = false
      console.error('Error checking MTR server connection:', error)
    } finally {
      isChecking.value = false
    }
  }

  return {
    isConnected,
    serverStatus,
    isChecking,
    checkConnection,
  }
}