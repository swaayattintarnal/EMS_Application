const Employee = require('../../models/employees'); 

const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params; 
        const updates = req.body; 
        // console.log("checking:",req.body)

        if (updates.employment_type) {
            if (updates.employment_type === 'Intern') updates.category = 'Intern';
            else if (updates.employment_type === 'Contract') updates.category = 'Contractual';
            else updates.category = 'Full-time';
        } else if (updates.category) {
            const lower = updates.category.toLowerCase();
            if (lower === 'intern') updates.employment_type = 'Intern';
            else if (lower === 'contractual' || lower === 'contract') updates.employment_type = 'Contract';
            else updates.employment_type = 'Full-Time';
        }

        if (updates.salary !== undefined) {
            updates.current_salary = Number(updates.salary);
        }
        if (updates.stipend !== undefined) {
            updates.current_stipend = Number(updates.stipend);
        }
        if (updates.status === 'Current' || updates.status === 'Working') {
            updates.status = 'Working';
        }

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