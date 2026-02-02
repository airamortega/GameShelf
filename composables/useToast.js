export const useToast = () => {
    const message = useState('toast-message', () => '')
    const visible = useState('toast-visible', () => false)
    const type = useState('toast-type', () => 'success') // 'success' o 'error'

    const showToast = (msg, toastType = 'success') => {
        message.value = msg
        type.value = toastType
        visible.value = true

        setTimeout(() => {
            visible.value = false
        }, 3000)
    }

    return { message, visible, type, showToast }
}

