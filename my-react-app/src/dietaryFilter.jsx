import { useState } from 'react'


export function DietaryFilter() {
    const [veganOnly, setVeganOnly] = useState(false);


    let mainPage = <div>
        <h3 style={{color: '#ffffff'}}>
            Dietary Restrictions (Currently in testingg)
        </h3>
        <label>
            <input
                type="checkbox"
                checked={veganOnly}
                onChange={(e) => setVeganOnly(e.target.checked)}
            />
            Vegan Only
        </label>
    </div>

    return (mainPage)
}