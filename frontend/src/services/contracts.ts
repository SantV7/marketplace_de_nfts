export interface User { id: string; email: string; name: string; username: string }
export interface Review { name: string; date: string; comment: string }
export interface Nft { reviews?: Review[]; id: number; name: string; price: string; image: string; category: string; network: string; version?: number; isNew?: boolean; isTrending?: boolean; previousPrice?: string; edition: string; available: number; description?: string; editions?: Array<{ name: string; available: number }>; rating?: number; tokenId?: string; collection?: string; attributes?: string[]; thumbnails?: string[]; contractAddress?: string; blockchain?: string; royalty?: string }
export interface NftListParams { search?: string; category?: string; network?: string[]; min?: number; max?: number; sort?: string; tab?: string; page?: number; limit?: number }
export interface NftPage { data: Nft[]; total: number; page: number; pageCount: number }
export interface CartItem { id: string; nftId: string; name: string; image: string; price: string; edition: string; styleId?: string; styleLabel?: string; styleFilter?: string; quantity: number; availableQuantity: number }
export interface CartResponse { items: CartItem[] }
export interface Quote { subtotal: string; discount: string; networkFee: string; total: string; currency: 'ETH'; expiresAt: string; coupon?: string; version: number }
export interface Session { user: User }
export interface AuthResponse { token: string; user: User }
export interface Order { orderId: string; userId?: string; status: 'pending' | 'confirmed' | 'rejected'; items: CartItem[]; total: string; discount: string; networkFee: string; txHash: string; version: number; date: string; wallet?: string; provider?: string; network?: string }
export interface Wallet { id: string; address: string; network: string; label: string; primary?: boolean }
