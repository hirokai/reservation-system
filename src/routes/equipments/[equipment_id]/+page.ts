// Get machine ID from URL

export async function load({ params,data }) {
    return {
        ...data,
        equipment_id: params.equipment_id,
    }
}
