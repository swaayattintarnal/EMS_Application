const Employee = require('../../models/employees'); 

const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params; 
        const updates = req.body; 
        // console.log("checking:",req.body)

        const employee = await Employee.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.status(200).json({
            message: 'Employee updated successfully',
            data: employee,
        });
    } catch (error) {
        console.error('Error updating employee:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

module.exports = { updateEmployee };